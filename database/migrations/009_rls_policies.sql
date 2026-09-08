CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
DECLARE
  company_uuid UUID;
BEGIN
  SELECT company_id INTO company_uuid
  FROM public.company_users
  WHERE user_id = auth.uid()
    AND status = 'active'
    AND deleted_at IS NULL
  LIMIT 1;
  RETURN company_uuid;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'super_admin'
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_client_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'cliente'
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  action_text TEXT;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    action_text := 'INSERT';
    old_data := NULL;
    new_data := to_jsonb(NEW);
  ELSIF (TG_OP = 'UPDATE') THEN
    action_text := 'UPDATE';
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSIF (TG_OP = 'DELETE') THEN
    action_text := 'DELETE';
    old_data := to_jsonb(OLD);
    new_data := NULL;
  ELSE
    RETURN NULL;
  END IF;

  INSERT INTO public.audit_logs (
    company_id,
    user_id,
    action,
    entity,
    entity_id,
    old_data,
    new_data,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    CASE
      WHEN TG_ARGV[0] = 'companies' THEN OLD.id
      ELSE COALESCE(NEW.company_id, OLD.company_id)
    END,
    auth.uid(),
    action_text,
    TG_ARGV[0],
    COALESCE(NEW.id, OLD.id),
    old_data,
    new_data,
    inet_client_addr()::TEXT,
    current_setting('application_name', true),
    now()
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT
  USING (
    (id = auth.uid())
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_update ON public.profiles
  FOR UPDATE
  USING (
    (id = auth.uid())
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS profiles_insert ON public.profiles;
CREATE POLICY profiles_insert ON public.profiles
  FOR INSERT
  WITH CHECK (
    (id = auth.uid())
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS roles_select ON public.roles;
CREATE POLICY roles_select ON public.roles
  FOR SELECT
  USING (
    public.is_super_admin()
    OR auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS roles_all_superadmin ON public.roles;
CREATE POLICY roles_all_superadmin ON public.roles
  FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS permissions_select ON public.permissions;
CREATE POLICY permissions_select ON public.permissions
  FOR SELECT
  USING (
    public.is_super_admin()
    OR auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS permissions_all_superadmin ON public.permissions;
CREATE POLICY permissions_all_superadmin ON public.permissions
  FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS role_permissions_select ON public.role_permissions;
CREATE POLICY role_permissions_select ON public.role_permissions
  FOR SELECT
  USING (
    public.is_super_admin()
    OR auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS role_permissions_all_superadmin ON public.role_permissions;
CREATE POLICY role_permissions_all_superadmin ON public.role_permissions
  FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS plans_select ON public.plans;
CREATE POLICY plans_select ON public.plans
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS plans_all_superadmin ON public.plans;
CREATE POLICY plans_all_superadmin ON public.plans
  FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS companies_select ON public.companies;
CREATE POLICY companies_select ON public.companies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_users
      WHERE company_id = companies.id
        AND user_id = auth.uid()
        AND status = 'active'
        AND deleted_at IS NULL
    )
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS companies_select_public_slug ON public.companies;
CREATE POLICY companies_select_public_slug ON public.companies
  FOR SELECT
  USING (
    status = 'active'
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS companies_insert ON public.companies;
CREATE POLICY companies_insert ON public.companies
  FOR INSERT
  WITH CHECK (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1
      FROM public.company_users
      WHERE company_id = companies.id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

DROP POLICY IF EXISTS companies_update ON public.companies;
CREATE POLICY companies_update ON public.companies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_users
      WHERE company_id = companies.id
        AND user_id = auth.uid()
        AND status = 'active'
        AND deleted_at IS NULL
    )
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS subscriptions_select ON public.subscriptions;
CREATE POLICY subscriptions_select ON public.subscriptions
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS subscriptions_all_company ON public.subscriptions;
CREATE POLICY subscriptions_all_company ON public.subscriptions
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS company_users_select ON public.company_users;
CREATE POLICY company_users_select ON public.company_users
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR user_id = auth.uid()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS company_users_all_company ON public.company_users;
CREATE POLICY company_users_all_company ON public.company_users
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS service_categories_select ON public.service_categories;
CREATE POLICY service_categories_select ON public.service_categories
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS service_categories_select_public ON public.service_categories;
CREATE POLICY service_categories_select_public ON public.service_categories
  FOR SELECT
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS service_categories_all_company ON public.service_categories;
CREATE POLICY service_categories_all_company ON public.service_categories
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS services_select ON public.services;
CREATE POLICY services_select ON public.services
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS services_select_public ON public.services;
CREATE POLICY services_select_public ON public.services
  FOR SELECT
  USING (
    status = 'active'
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS services_all_company ON public.services
;
CREATE POLICY services_all_company ON public.services
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS professionals_select ON public.professionals;
CREATE POLICY professionals_select ON public.professionals
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS professionals_select_public ON public.professionals;
CREATE POLICY professionals_select_public ON public.professionals
  FOR SELECT
  USING (
    status = 'active'
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS professionals_all_company ON public.professionals;
CREATE POLICY professionals_all_company ON public.professionals
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS professional_services_select ON public.professional_services;
CREATE POLICY professional_services_select ON public.professional_services
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS professional_services_select_public ON public.professional_services;
CREATE POLICY professional_services_select_public ON public.professional_services
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS professional_services_all_company ON public.professional_services;
CREATE POLICY professional_services_all_company ON public.professional_services
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS clients_select ON public.clients;
CREATE POLICY clients_select ON public.clients
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS clients_select_self ON public.clients;
CREATE POLICY clients_select_self ON public.clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'cliente'
        AND (
          p.phone = clients.phone
          OR p.whatsapp = clients.whatsapp
          OR p.email = clients.email::TEXT
        )
    )
  );

DROP POLICY IF EXISTS clients_all_company ON public.clients;
CREATE POLICY clients_all_company ON public.clients
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS business_hours_select ON public.business_hours;
CREATE POLICY business_hours_select ON public.business_hours
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS business_hours_select_public ON public.business_hours;
CREATE POLICY business_hours_select_public ON public.business_hours
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS business_hours_all_company ON public.business_hours;
CREATE POLICY business_hours_all_company ON public.business_hours
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS professional_hours_select ON public.professional_hours;
CREATE POLICY professional_hours_select ON public.professional_hours
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS professional_hours_select_public ON public.professional_hours;
CREATE POLICY professional_hours_select_public ON public.professional_hours
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS professional_hours_all_company ON public.professional_hours;
CREATE POLICY professional_hours_all_company ON public.professional_hours
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS holidays_select ON public.holidays;
CREATE POLICY holidays_select ON public.holidays
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS holidays_all_company ON public.holidays;
CREATE POLICY holidays_all_company ON public.holidays
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS schedule_blocks_select ON public.schedule_blocks;
CREATE POLICY schedule_blocks_select ON public.schedule_blocks
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS schedule_blocks_all_company ON public.schedule_blocks;
CREATE POLICY schedule_blocks_all_company ON public.schedule_blocks
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS appointments_select ON public.appointments;
CREATE POLICY appointments_select ON public.appointments
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS appointments_select_client ON public.appointments;
CREATE POLICY appointments_select_client ON public.appointments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients c
      JOIN public.profiles p ON (
        p.phone = c.phone
        OR p.whatsapp = c.whatsapp
        OR p.email = c.email::TEXT
      )
      WHERE c.id = appointments.client_id
        AND p.id = auth.uid()
        AND p.role = 'cliente'
    )
  );

DROP POLICY IF EXISTS appointments_all_company ON public.appointments;
CREATE POLICY appointments_all_company ON public.appointments
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS appointments_insert_public ON public.appointments;
CREATE POLICY appointments_insert_public ON public.appointments
  FOR INSERT
  WITH CHECK (
    company_id IS NOT NULL
    AND status = 'pending'
  );

DROP POLICY IF EXISTS appointment_status_history_select ON public.appointment_status_history;
CREATE POLICY appointment_status_history_select ON public.appointment_status_history
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS appointment_status_history_all_company ON public.appointment_status_history;
CREATE POLICY appointment_status_history_all_company ON public.appointment_status_history
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS sales_select ON public.sales;
CREATE POLICY sales_select ON public.sales
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS sales_all_company ON public.sales;
CREATE POLICY sales_all_company ON public.sales
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS sale_items_select ON public.sale_items;
CREATE POLICY sale_items_select ON public.sale_items
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS sale_items_all_company ON public.sale_items;
CREATE POLICY sale_items_all_company ON public.sale_items
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS payments_select ON public.payments;
CREATE POLICY payments_select ON public.payments
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS payments_all_company ON public.payments;
CREATE POLICY payments_all_company ON public.payments
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS commissions_select ON public.commissions;
CREATE POLICY commissions_select ON public.commissions
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS commissions_select_professional ON public.commissions;
CREATE POLICY commissions_select_professional ON public.commissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.professionals pr
      WHERE pr.id = commissions.professional_id
        AND pr.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS commissions_all_company ON public.commissions;
CREATE POLICY commissions_all_company ON public.commissions
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS notifications_select ON public.notifications;
CREATE POLICY notifications_select ON public.notifications
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS notifications_all_user ON public.notifications;
CREATE POLICY notifications_all_user ON public.notifications
  FOR ALL
  USING (
    user_id = auth.uid()
    OR company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    user_id = auth.uid()
    OR company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS settings_select ON public.settings;
CREATE POLICY settings_select ON public.settings
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS settings_all_company ON public.settings;
CREATE POLICY settings_all_company ON public.settings
  FOR ALL
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS audit_logs_select ON public.audit_logs;
CREATE POLICY audit_logs_select ON public.audit_logs
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS audit_logs_insert ON public.audit_logs;
CREATE POLICY audit_logs_insert ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

DROP TRIGGER IF EXISTS audit_trigger_appointments ON public.appointments;
CREATE TRIGGER audit_trigger_appointments
AFTER INSERT OR UPDATE OR DELETE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func('appointments');

DROP TRIGGER IF EXISTS audit_trigger_services ON public.services;
CREATE TRIGGER audit_trigger_services
AFTER INSERT OR UPDATE OR DELETE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func('services');

DROP TRIGGER IF EXISTS audit_trigger_clients ON public.clients;
CREATE TRIGGER audit_trigger_clients
AFTER INSERT OR UPDATE OR DELETE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func('clients');

DROP TRIGGER IF EXISTS audit_trigger_professionals ON public.professionals;
CREATE TRIGGER audit_trigger_professionals
AFTER INSERT OR UPDATE OR DELETE ON public.professionals
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func('professionals');

DROP TRIGGER IF EXISTS audit_trigger_sales ON public.sales;
CREATE TRIGGER audit_trigger_sales
AFTER INSERT OR UPDATE OR DELETE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func('sales');

DROP TRIGGER IF EXISTS audit_trigger_companies ON public.companies;
CREATE TRIGGER audit_trigger_companies
AFTER INSERT OR UPDATE OR DELETE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func('companies');
