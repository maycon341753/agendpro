-- ============================================================================
--  SCRIPT COMPLETO - PLATAFORMA SAAS AGENDPRO
--  Clinicas Projeto Supabase (ixwdnrvgtdcdljqtgfzb)
--
--  COMO USAR:
--  1. Acesse o painel Supabase: https://supabase.com/dashboard/project/ixwdnrvgtdcdljqtgfzb
--  2. Menu SQL Editor
--  3. New Query
--  4. Cole TODO o conteúdo deste arquivo
--  5. Clique em RUN (▶)
--  6. Pronto! Todas tabelas, RLS, policies, seed e triggers são criados.
-- ============================================================================

SET search_path TO public;

-- ============================================================================
-- 001 — EXTENSÕES E FUNÇÕES BÁSICAS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 002 — PROFILES, ROLES, PERMISSIONS, ROLE_PERMISSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  whatsapp TEXT,
  role TEXT DEFAULT 'cliente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT,
  resource TEXT,
  action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at);

CREATE TRIGGER set_updated_at_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 003 — PLANS, COMPANIES, SUBSCRIPTIONS, COMPANY_USERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(10,2) NOT NULL DEFAULT 0,
  description JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trade_name TEXT,
  document TEXT,
  email CITEXT,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#2563eb',
  secondary_color TEXT NOT NULL DEFAULT '#10b981',
  slug CITEXT UNIQUE NOT NULL,
  business_type TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  plan_id UUID REFERENCES public.plans(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE,
  stripe_subscription_id TEXT,
  mp_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(company_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_deleted_at ON public.companies(deleted_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id ON public.subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON public.company_users(company_id);
CREATE INDEX IF NOT EXISTS idx_company_users_user_id ON public.company_users(user_id);
CREATE INDEX IF NOT EXISTS idx_company_users_status ON public.company_users(status);
CREATE INDEX IF NOT EXISTS idx_company_users_deleted_at ON public.company_users(deleted_at);

CREATE TRIGGER set_updated_at_companies BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_subscriptions BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_company_users BEFORE UPDATE ON public.company_users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 004 — SERVICE_CATEGORIES, SERVICES, PROFESSIONALS, PROFESSIONAL_SERVICES, CLIENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration_minutes INT NOT NULL DEFAULT 60,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  specialty TEXT,
  phone TEXT,
  email CITEXT,
  commission_type TEXT NOT NULL DEFAULT 'percent',
  commission_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.professional_services (
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (professional_id, service_id)
);

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  cpf TEXT,
  phone TEXT,
  whatsapp TEXT,
  email CITEXT,
  birth_date DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  total_spent NUMERIC(10,2) NOT NULL DEFAULT 0,
  appointments_count INT NOT NULL DEFAULT 0,
  last_appointment_at TIMESTAMPTZ,
  first_appointment_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_service_categories_company_id ON public.service_categories(company_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_deleted_at ON public.service_categories(deleted_at);
CREATE INDEX IF NOT EXISTS idx_services_company_id ON public.services(company_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services(status);
CREATE INDEX IF NOT EXISTS idx_services_deleted_at ON public.services(deleted_at);
CREATE INDEX IF NOT EXISTS idx_professionals_company_id ON public.professionals(company_id);
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON public.professionals(user_id);
CREATE INDEX IF NOT EXISTS idx_professionals_status ON public.professionals(status);
CREATE INDEX IF NOT EXISTS idx_professionals_deleted_at ON public.professionals(deleted_at);
CREATE INDEX IF NOT EXISTS idx_professional_services_company_id ON public.professional_services(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON public.clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON public.clients(deleted_at);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at_service_categories BEFORE UPDATE ON public.service_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_services BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_professionals BEFORE UPDATE ON public.professionals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_clients BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 005 — BUSINESS_HOURS, PROFESSIONAL_HOURS, HOLIDAYS, SCHEDULE_BLOCKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_open BOOLEAN NOT NULL DEFAULT true,
  open_time TIME,
  close_time TIME,
  break_start TIME,
  break_end TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS public.professional_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_open BOOLEAN NOT NULL DEFAULT true,
  open_time TIME,
  close_time TIME,
  break_start TIME,
  break_end TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(professional_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS public.holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  name TEXT,
  recurring BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  block_type TEXT NOT NULL CHECK (block_type IN ('day', 'time', 'range')),
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_hours_company_id ON public.business_hours(company_id);
CREATE INDEX IF NOT EXISTS idx_professional_hours_professional_id ON public.professional_hours(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_hours_company_id ON public.professional_hours(company_id);
CREATE INDEX IF NOT EXISTS idx_holidays_company_id ON public.holidays(company_id);
CREATE INDEX IF NOT EXISTS idx_holidays_date ON public.holidays(date);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_company_id ON public.schedule_blocks(company_id);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_professional_id ON public.schedule_blocks(professional_id);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_dates ON public.schedule_blocks(start_date, end_date);

CREATE TRIGGER set_updated_at_business_hours BEFORE UPDATE ON public.business_hours FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_professional_hours BEFORE UPDATE ON public.professional_hours FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 006 — APPOINTMENTS, APPOINTMENT_STATUS_HISTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT,
  price NUMERIC(10,2),
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  final_price NUMERIC(10,2),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_status TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.appointment_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_company_id ON public.appointments(company_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON public.appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_company_date ON public.appointments(company_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_date ON public.appointments(professional_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_client_date ON public.appointments(client_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at ON public.appointments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_appointment_status_history_appointment_id ON public.appointment_status_history(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_status_history_company_id ON public.appointment_status_history(company_id);
CREATE INDEX IF NOT EXISTS idx_appointment_status_history_created_at ON public.appointment_status_history(created_at);

CREATE TRIGGER set_updated_at_appointments BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.appointment_status_history_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.appointment_status_history (
      appointment_id, company_id, old_status, new_status, changed_by, created_at
    ) VALUES (
      NEW.id, NEW.company_id, NULL, NEW.status, NEW.created_by, now()
    );
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE' AND OLD.status <> NEW.status) THEN
    INSERT INTO public.appointment_status_history (
      appointment_id, company_id, old_status, new_status, changed_by, created_at
    ) VALUES (
      NEW.id, NEW.company_id, OLD.status, NEW.status, NEW.updated_by, now()
    );
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointment_status_history
AFTER INSERT OR UPDATE OF status ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.appointment_status_history_trigger();

-- ============================================================================
-- 007 — SALES, SALE_ITEMS, PAYMENTS, COMMISSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL UNIQUE,
  date DATE NOT NULL,
  gross_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  description TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid',
  paid_at TIMESTAMPTZ,
  transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  period_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_company_id ON public.sales(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_client_id ON public.sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_professional_id ON public.sales(professional_id);
CREATE INDEX IF NOT EXISTS idx_sales_appointment_id ON public.sales(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_deleted_at ON public.sales(deleted_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_company_id ON public.sale_items(company_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_service_id ON public.sale_items(service_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_professional_id ON public.sale_items(professional_id);
CREATE INDEX IF NOT EXISTS idx_payments_sale_id ON public.payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_payments_company_id ON public.payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON public.payments(method);
CREATE INDEX IF NOT EXISTS idx_commissions_company_id ON public.commissions(company_id);
CREATE INDEX IF NOT EXISTS idx_commissions_professional_id ON public.commissions(professional_id);
CREATE INDEX IF NOT EXISTS idx_commissions_sale_id ON public.commissions(sale_id);
CREATE INDEX IF NOT EXISTS idx_commissions_appointment_id ON public.commissions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_period_reference ON public.commissions(period_reference);

CREATE TRIGGER set_updated_at_sales BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_commissions BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 008 — NOTIFICATIONS, SETTINGS, AUDIT_LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
  key_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON public.notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_settings_company_id ON public.settings(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON public.audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_action_created ON public.audit_logs(company_id, action, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity, entity_id);

CREATE TRIGGER set_updated_at_settings BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 009 — RLS: FUNÇÕES HELPER, ENABLE RLS EM TODAS TABELAS, POLICIES, AUDIT TRIGGERS
-- ============================================================================
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
    SELECT 1 FROM public.profiles
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
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'cliente'
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Funcao helper para obter email do usuario logado (lê auth.users.email com SECURITY DEFINER,
-- ja que public.profiles NAO tem coluna email - email fica na tabela nativa auth.users do Supabase)
CREATE OR REPLACE FUNCTION public.auth_email()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT email::TEXT
    FROM auth.users
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  action_text TEXT;
  company_uuid UUID;
  entity_id_val UUID;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    action_text := 'INSERT'; old_data := NULL; new_data := to_jsonb(NEW);
  ELSIF (TG_OP = 'UPDATE') THEN
    action_text := 'UPDATE'; old_data := to_jsonb(OLD); new_data := to_jsonb(NEW);
  ELSIF (TG_OP = 'DELETE') THEN
    action_text := 'DELETE'; old_data := to_jsonb(OLD); new_data := NULL;
  ELSE RETURN NULL; END IF;

  -- REGRA company_id (trata companies separado pois ela NAO TEM company_id — id = company_id)
  IF TG_ARGV[0] = 'companies' THEN
    IF TG_OP = 'INSERT' THEN company_uuid := NEW.id;
    ELSIF TG_OP = 'UPDATE' THEN company_uuid := COALESCE(NEW.id, OLD.id);
    ELSE company_uuid := OLD.id; END IF;
  ELSE
    IF TG_OP = 'INSERT' THEN company_uuid := NEW.company_id;
    ELSIF TG_OP = 'UPDATE' THEN company_uuid := COALESCE(NEW.company_id, OLD.company_id);
    ELSE company_uuid := OLD.company_id; END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN entity_id_val := OLD.id;
  ELSE entity_id_val := NEW.id; END IF;

  INSERT INTO public.audit_logs (
    company_id, user_id, action, entity, entity_id, old_data, new_data,
    ip_address, user_agent, created_at
  ) VALUES (
    company_uuid,
    auth.uid(), action_text, TG_ARGV[0], entity_id_val, old_data, new_data,
    inet_client_addr()::TEXT, current_setting('application_name', true), now()
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

-- POLICIES: PROFILES
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles FOR SELECT USING ((id = auth.uid()) OR public.is_super_admin());
DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING ((id = auth.uid()) OR public.is_super_admin());
DROP POLICY IF EXISTS profiles_insert ON public.profiles;
CREATE POLICY profiles_insert ON public.profiles FOR INSERT WITH CHECK ((id = auth.uid()) OR public.is_super_admin());

-- POLICIES: ROLES
DROP POLICY IF EXISTS roles_select ON public.roles;
CREATE POLICY roles_select ON public.roles FOR SELECT USING (public.is_super_admin() OR auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS roles_all_superadmin ON public.roles;
CREATE POLICY roles_all_superadmin ON public.roles FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- POLICIES: PERMISSIONS
DROP POLICY IF EXISTS permissions_select ON public.permissions;
CREATE POLICY permissions_select ON public.permissions FOR SELECT USING (public.is_super_admin() OR auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS permissions_all_superadmin ON public.permissions;
CREATE POLICY permissions_all_superadmin ON public.permissions FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- POLICIES: ROLE_PERMISSIONS
DROP POLICY IF EXISTS role_permissions_select ON public.role_permissions;
CREATE POLICY role_permissions_select ON public.role_permissions FOR SELECT USING (public.is_super_admin() OR auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS role_permissions_all_superadmin ON public.role_permissions;
CREATE POLICY role_permissions_all_superadmin ON public.role_permissions FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- POLICIES: PLANS
DROP POLICY IF EXISTS plans_select ON public.plans;
CREATE POLICY plans_select ON public.plans FOR SELECT USING (true);
DROP POLICY IF EXISTS plans_all_superadmin ON public.plans;
CREATE POLICY plans_all_superadmin ON public.plans FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- POLICIES: COMPANIES
DROP POLICY IF EXISTS companies_select ON public.companies;
CREATE POLICY companies_select ON public.companies FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.company_users WHERE company_id = companies.id AND user_id = auth.uid() AND status = 'active' AND deleted_at IS NULL)
  OR public.is_super_admin()
);
DROP POLICY IF EXISTS companies_select_public_slug ON public.companies;
CREATE POLICY companies_select_public_slug ON public.companies FOR SELECT USING (status = 'active' AND deleted_at IS NULL);
DROP POLICY IF EXISTS companies_insert ON public.companies;
CREATE POLICY companies_insert ON public.companies FOR INSERT WITH CHECK (
  public.is_super_admin()
  OR EXISTS (SELECT 1 FROM public.company_users WHERE company_id = companies.id AND user_id = auth.uid() AND status = 'active')
);
DROP POLICY IF EXISTS companies_update ON public.companies;
CREATE POLICY companies_update ON public.companies FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.company_users WHERE company_id = companies.id AND user_id = auth.uid() AND status = 'active' AND deleted_at IS NULL)
  OR public.is_super_admin()
);

-- POLICIES: SUBSCRIPTIONS
DROP POLICY IF EXISTS subscriptions_select ON public.subscriptions;
CREATE POLICY subscriptions_select ON public.subscriptions FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS subscriptions_all_company ON public.subscriptions;
CREATE POLICY subscriptions_all_company ON public.subscriptions FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: COMPANY_USERS
DROP POLICY IF EXISTS company_users_select ON public.company_users;
CREATE POLICY company_users_select ON public.company_users FOR SELECT USING (
  company_id = public.get_user_company_id() OR user_id = auth.uid() OR public.is_super_admin()
);
DROP POLICY IF EXISTS company_users_all_company ON public.company_users;
CREATE POLICY company_users_all_company ON public.company_users FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: SERVICE_CATEGORIES
DROP POLICY IF EXISTS service_categories_select ON public.service_categories;
CREATE POLICY service_categories_select ON public.service_categories FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS service_categories_select_public ON public.service_categories;
CREATE POLICY service_categories_select_public ON public.service_categories FOR SELECT USING (deleted_at IS NULL);
DROP POLICY IF EXISTS service_categories_all_company ON public.service_categories;
CREATE POLICY service_categories_all_company ON public.service_categories FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: SERVICES
DROP POLICY IF EXISTS services_select ON public.services;
CREATE POLICY services_select ON public.services FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS services_select_public ON public.services;
CREATE POLICY services_select_public ON public.services FOR SELECT USING (status = 'active' AND deleted_at IS NULL);
DROP POLICY IF EXISTS services_all_company ON public.services;
CREATE POLICY services_all_company ON public.services FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: PROFESSIONALS
DROP POLICY IF EXISTS professionals_select ON public.professionals;
CREATE POLICY professionals_select ON public.professionals FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS professionals_select_public ON public.professionals;
CREATE POLICY professionals_select_public ON public.professionals FOR SELECT USING (status = 'active' AND deleted_at IS NULL);
DROP POLICY IF EXISTS professionals_all_company ON public.professionals;
CREATE POLICY professionals_all_company ON public.professionals FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: PROFESSIONAL_SERVICES
DROP POLICY IF EXISTS professional_services_select ON public.professional_services;
CREATE POLICY professional_services_select ON public.professional_services FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS professional_services_select_public ON public.professional_services;
CREATE POLICY professional_services_select_public ON public.professional_services FOR SELECT USING (true);
DROP POLICY IF EXISTS professional_services_all_company ON public.professional_services;
CREATE POLICY professional_services_all_company ON public.professional_services FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: CLIENTS
DROP POLICY IF EXISTS clients_select ON public.clients;
CREATE POLICY clients_select ON public.clients FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS clients_select_self ON public.clients;
CREATE POLICY clients_select_self ON public.clients FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'cliente'
      AND (
        p.phone = clients.phone
        OR p.whatsapp = clients.whatsapp
        OR public.auth_email() = clients.email::TEXT
      )
  )
);
DROP POLICY IF EXISTS clients_all_company ON public.clients;
CREATE POLICY clients_all_company ON public.clients FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: BUSINESS_HOURS
DROP POLICY IF EXISTS business_hours_select ON public.business_hours;
CREATE POLICY business_hours_select ON public.business_hours FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS business_hours_select_public ON public.business_hours;
CREATE POLICY business_hours_select_public ON public.business_hours FOR SELECT USING (true);
DROP POLICY IF EXISTS business_hours_all_company ON public.business_hours;
CREATE POLICY business_hours_all_company ON public.business_hours FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: PROFESSIONAL_HOURS
DROP POLICY IF EXISTS professional_hours_select ON public.professional_hours;
CREATE POLICY professional_hours_select ON public.professional_hours FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS professional_hours_select_public ON public.professional_hours;
CREATE POLICY professional_hours_select_public ON public.professional_hours FOR SELECT USING (true);
DROP POLICY IF EXISTS professional_hours_all_company ON public.professional_hours;
CREATE POLICY professional_hours_all_company ON public.professional_hours FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: HOLIDAYS
DROP POLICY IF EXISTS holidays_select ON public.holidays;
CREATE POLICY holidays_select ON public.holidays FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS holidays_all_company ON public.holidays;
CREATE POLICY holidays_all_company ON public.holidays FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: SCHEDULE_BLOCKS
DROP POLICY IF EXISTS schedule_blocks_select ON public.schedule_blocks;
CREATE POLICY schedule_blocks_select ON public.schedule_blocks FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS schedule_blocks_all_company ON public.schedule_blocks;
CREATE POLICY schedule_blocks_all_company ON public.schedule_blocks FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: APPOINTMENTS
DROP POLICY IF EXISTS appointments_select ON public.appointments;
CREATE POLICY appointments_select ON public.appointments FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS appointments_select_client ON public.appointments;
CREATE POLICY appointments_select_client ON public.appointments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.clients c
    JOIN public.profiles p ON (
      p.phone = c.phone
      OR p.whatsapp = c.whatsapp
      OR public.auth_email() = c.email::TEXT
    )
    WHERE c.id = appointments.client_id AND p.id = auth.uid() AND p.role = 'cliente')
);
DROP POLICY IF EXISTS appointments_all_company ON public.appointments;
CREATE POLICY appointments_all_company ON public.appointments FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS appointments_insert_public ON public.appointments;
CREATE POLICY appointments_insert_public ON public.appointments FOR INSERT WITH CHECK (company_id IS NOT NULL AND status = 'pending');

-- POLICIES: APPOINTMENT_STATUS_HISTORY
DROP POLICY IF EXISTS appointment_status_history_select ON public.appointment_status_history;
CREATE POLICY appointment_status_history_select ON public.appointment_status_history FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS appointment_status_history_all_company ON public.appointment_status_history;
CREATE POLICY appointment_status_history_all_company ON public.appointment_status_history FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: SALES
DROP POLICY IF EXISTS sales_select ON public.sales;
CREATE POLICY sales_select ON public.sales FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS sales_all_company ON public.sales;
CREATE POLICY sales_all_company ON public.sales FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: SALE_ITEMS
DROP POLICY IF EXISTS sale_items_select ON public.sale_items;
CREATE POLICY sale_items_select ON public.sale_items FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS sale_items_all_company ON public.sale_items;
CREATE POLICY sale_items_all_company ON public.sale_items FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: PAYMENTS
DROP POLICY IF EXISTS payments_select ON public.payments;
CREATE POLICY payments_select ON public.payments FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS payments_all_company ON public.payments;
CREATE POLICY payments_all_company ON public.payments FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: COMMISSIONS
DROP POLICY IF EXISTS commissions_select ON public.commissions;
CREATE POLICY commissions_select ON public.commissions FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS commissions_select_professional ON public.commissions;
CREATE POLICY commissions_select_professional ON public.commissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.professionals pr WHERE pr.id = commissions.professional_id AND pr.user_id = auth.uid())
);
DROP POLICY IF EXISTS commissions_all_company ON public.commissions;
CREATE POLICY commissions_all_company ON public.commissions FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: NOTIFICATIONS
DROP POLICY IF EXISTS notifications_select ON public.notifications;
CREATE POLICY notifications_select ON public.notifications FOR SELECT USING (
  user_id = auth.uid() OR company_id = public.get_user_company_id() OR public.is_super_admin()
);
DROP POLICY IF EXISTS notifications_all_user ON public.notifications;
CREATE POLICY notifications_all_user ON public.notifications FOR ALL
  USING (user_id = auth.uid() OR company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (user_id = auth.uid() OR company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: SETTINGS
DROP POLICY IF EXISTS settings_select ON public.settings;
CREATE POLICY settings_select ON public.settings FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS settings_all_company ON public.settings;
CREATE POLICY settings_all_company ON public.settings FOR ALL
  USING (company_id = public.get_user_company_id() OR public.is_super_admin())
  WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin());

-- POLICIES: AUDIT_LOGS
DROP POLICY IF EXISTS audit_logs_select ON public.audit_logs;
CREATE POLICY audit_logs_select ON public.audit_logs FOR SELECT USING (company_id = public.get_user_company_id() OR public.is_super_admin());
DROP POLICY IF EXISTS audit_logs_insert ON public.audit_logs;
CREATE POLICY audit_logs_insert ON public.audit_logs FOR INSERT WITH CHECK (true);

-- AUDIT TRIGGERS NAS TABELAS PRINCIPAIS
DROP TRIGGER IF EXISTS audit_trigger_appointments ON public.appointments;
CREATE TRIGGER audit_trigger_appointments AFTER INSERT OR UPDATE OR DELETE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func('appointments');
DROP TRIGGER IF EXISTS audit_trigger_services ON public.services;
CREATE TRIGGER audit_trigger_services AFTER INSERT OR UPDATE OR DELETE ON public.services FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func('services');
DROP TRIGGER IF EXISTS audit_trigger_clients ON public.clients;
CREATE TRIGGER audit_trigger_clients AFTER INSERT OR UPDATE OR DELETE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func('clients');
DROP TRIGGER IF EXISTS audit_trigger_professionals ON public.professionals;
CREATE TRIGGER audit_trigger_professionals AFTER INSERT OR UPDATE OR DELETE ON public.professionals FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func('professionals');
DROP TRIGGER IF EXISTS audit_trigger_sales ON public.sales;
CREATE TRIGGER audit_trigger_sales AFTER INSERT OR UPDATE OR DELETE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func('sales');
DROP TRIGGER IF EXISTS audit_trigger_companies ON public.companies;
CREATE TRIGGER audit_trigger_companies AFTER INSERT OR UPDATE OR DELETE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func('companies');

-- ============================================================================
-- 010 — SEED INICIAL: ROLES, PERMISSIONS, PLANOS, STUDIO BELLA, CLIENTES ETC
-- ============================================================================
INSERT INTO public.roles (id, name, display_name, description, created_at) VALUES
  (gen_random_uuid(), 'super_admin', 'Super Admin', 'Acesso total a plataforma', now()),
  (gen_random_uuid(), 'admin_empresa', 'Admin da Empresa', 'Administrador completo da empresa', now()),
  (gen_random_uuid(), 'gerente', 'Gerente', 'Gerente da unidade', now()),
  (gen_random_uuid(), 'recepcionista', 'Recepcionista', 'Atendimento e agendamentos', now()),
  (gen_random_uuid(), 'profissional', 'Profissional', 'Prestador de servicos', now()),
  (gen_random_uuid(), 'cliente', 'Cliente', 'Cliente final', now());

INSERT INTO public.permissions (id, name, display_name, resource, action, created_at) VALUES
  (gen_random_uuid(), 'dashboard.view', 'Ver Dashboard', 'dashboard', 'view', now()),
  (gen_random_uuid(), 'appointments.create', 'Criar Agendamentos', 'appointments', 'create', now()),
  (gen_random_uuid(), 'appointments.edit', 'Editar Agendamentos', 'appointments', 'edit', now()),
  (gen_random_uuid(), 'clients.manage', 'Gerenciar Clientes', 'clients', 'manage', now()),
  (gen_random_uuid(), 'services.manage', 'Gerenciar Servicos', 'services', 'manage', now()),
  (gen_random_uuid(), 'professionals.manage', 'Gerenciar Profissionais', 'professionals', 'manage', now()),
  (gen_random_uuid(), 'sales.view', 'Ver Vendas', 'sales', 'view', now()),
  (gen_random_uuid(), 'finance.view', 'Ver Financeiro', 'finance', 'view', now()),
  (gen_random_uuid(), 'reports.view', 'Ver Relatorios', 'reports', 'view', now()),
  (gen_random_uuid(), 'settings.manage', 'Gerenciar Configuracoes', 'settings', 'manage', now()),
  (gen_random_uuid(), 'superadmin.access', 'Acesso Super Admin', 'superadmin', 'access', now());

INSERT INTO public.role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, now() FROM public.roles r CROSS JOIN public.permissions p WHERE r.name = 'super_admin';

INSERT INTO public.role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, now() FROM public.roles r JOIN public.permissions p ON p.name IN (
  'dashboard.view', 'appointments.create', 'appointments.edit',
  'clients.manage', 'services.manage', 'professionals.manage',
  'sales.view', 'finance.view', 'reports.view', 'settings.manage'
) WHERE r.name = 'admin_empresa';

INSERT INTO public.role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, now() FROM public.roles r JOIN public.permissions p ON p.name IN (
  'dashboard.view', 'appointments.create', 'appointments.edit',
  'clients.manage', 'services.manage', 'professionals.manage',
  'sales.view', 'reports.view'
) WHERE r.name = 'gerente';

INSERT INTO public.role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, now() FROM public.roles r JOIN public.permissions p ON p.name IN (
  'dashboard.view', 'appointments.create', 'appointments.edit',
  'clients.manage', 'sales.view'
) WHERE r.name = 'recepcionista';

INSERT INTO public.role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, now() FROM public.roles r JOIN public.permissions p ON p.name IN (
  'dashboard.view', 'sales.view'
) WHERE r.name = 'profissional';

INSERT INTO public.role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, now() FROM public.roles r JOIN public.permissions p ON p.name IN ('dashboard.view') WHERE r.name = 'cliente';

-- PLANOS SAAS
INSERT INTO public.plans (id, name, slug, price_monthly, price_yearly, description, features, limits, is_active, created_at) VALUES
  (gen_random_uuid(), 'Gratuito', 'gratuito', 0.00, 0.00,
    '{"pt-BR": "Plano basico gratuito para comecar"}'::jsonb,
    '["1 profissional", "50 agendamentos/mes", "Suporte por email"]'::jsonb,
    '{"professionals": 1, "appointments_monthly": 50, "storage_mb": 100}'::jsonb, true, now()),
  (gen_random_uuid(), 'Basico', 'basico', 79.00, 790.00,
    '{"pt-BR": "Plano basico para pequenos negocios"}'::jsonb,
    '["3 profissionais", "Agendamentos ilimitados", "Suporte prioritario", "WhatsApp integrado"]'::jsonb,
    '{"professionals": 3, "appointments_monthly": -1, "storage_mb": 500}'::jsonb, true, now()),
  (gen_random_uuid(), 'Profissional', 'profissional', 149.00, 1490.00,
    '{"pt-BR": "Plano profissional para negocios em crescimento"}'::jsonb,
    '["10 profissionais", "Agendamentos ilimitados", "Suporte VIP", "Todas integracoes", "Relatorios avancados"]'::jsonb,
    '{"professionals": 10, "appointments_monthly": -1, "storage_mb": 2000}'::jsonb, true, now()),
  (gen_random_uuid(), 'Enterprise', 'enterprise', 0.00, 0.00,
    '{"pt-BR": "Plano customizado para grandes empresas"}'::jsonb,
    '["Profissionais ilimitados", "Suporte dedicado", "Integracoes customizadas", "SLA garantido", "Onboarding dedicado"]'::jsonb,
    '{"professionals": -1, "appointments_monthly": -1, "storage_mb": -1}'::jsonb, true, now());

-- EMPRESA DEMO: STUDIO BELLA
INSERT INTO public.companies (id, name, trade_name, document, email, phone, whatsapp, address, city, state, zip_code, logo_url, primary_color, secondary_color, slug, business_type, status, plan_id, created_at, updated_at, deleted_at)
SELECT
  gen_random_uuid(),
  'Studio Bella Ltda',
  'Studio Bella',
  '12345678000100',
  'contato@studiobella.com.br',
  '(11) 3000-0000',
  '(11) 99999-0000',
  'Av. Paulista, 1000',
  'Sao Paulo',
  'SP',
  '01310-100',
  NULL,
  '#2563eb',
  '#10b981',
  'studio-bella',
  'salao_beleza',
  'active',
  (SELECT id FROM public.plans WHERE slug = 'profissional'),
  now(), now(), NULL;

-- CATEGORIAS
INSERT INTO public.service_categories (id, company_id, name, description, sort_order, created_at, updated_at, deleted_at) VALUES
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 'Cabelo', 'Servicos de cabelo como corte, escova, coloracao', 1, now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 'Unhas', 'Servicos de manicure e pedicure', 2, now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 'Estetica', 'Tratamentos esteticos e design de sobrancelhas', 3, now(), now(), NULL);

-- SERVICOS
INSERT INTO public.services (id, company_id, category_id, name, description, price, duration_minutes, image_url, status, created_at, updated_at, deleted_at) VALUES
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), (SELECT id FROM public.service_categories WHERE name = 'Cabelo' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')), 'Corte Feminino', 'Corte profissional com lavagem e finalizacao', 80.00, 60, NULL, 'active', now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), (SELECT id FROM public.service_categories WHERE name = 'Cabelo' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')), 'Escova Modelada', 'Escova modelada com produtos de qualidade', 60.00, 45, NULL, 'active', now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), (SELECT id FROM public.service_categories WHERE name = 'Unhas' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')), 'Manicure Tradicional', 'Cuidado com as unhas das maos, corte, lixamento e esmalte', 50.00, 60, NULL, 'active', now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), (SELECT id FROM public.service_categories WHERE name = 'Unhas' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')), 'Pedicure Tradicional', 'Cuidado completo com os pes, unhas e hidratacao', 60.00, 75, NULL, 'active', now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), (SELECT id FROM public.service_categories WHERE name = 'Estetica' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')), 'Design de Sobrancelhas', 'Design personalizado com henna ou tintura', 45.00, 30, NULL, 'active', now(), now(), NULL);

-- PROFISSIONAIS
INSERT INTO public.professionals (id, company_id, user_id, full_name, avatar_url, specialty, phone, email, commission_type, commission_value, status, created_at, updated_at, deleted_at) VALUES
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), NULL, 'Ana Silva', NULL, 'Cabelo', '(11) 98888-1111', 'ana@studiobella.com.br', 'percent', 30.00, 'active', now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), NULL, 'Juliana Santos', NULL, 'Unhas', '(11) 98888-2222', 'juliana@studiobella.com.br', 'percent', 30.00, 'active', now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), NULL, 'Carlos Oliveira', NULL, 'Cabelo', '(11) 98888-3333', 'carlos@studiobella.com.br', 'percent', 25.00, 'active', now(), now(), NULL);

-- PROFISSIONAL_SERVICES (quem faz o que)
INSERT INTO public.professional_services (professional_id, service_id, company_id, created_at)
SELECT p.id, s.id, p.company_id, now()
FROM public.professionals p JOIN public.services s ON s.company_id = p.company_id
WHERE p.full_name = 'Ana Silva' AND s.name IN ('Corte Feminino', 'Escova Modelada');

INSERT INTO public.professional_services (professional_id, service_id, company_id, created_at)
SELECT p.id, s.id, p.company_id, now()
FROM public.professionals p JOIN public.services s ON s.company_id = p.company_id
WHERE p.full_name = 'Juliana Santos' AND s.name IN ('Manicure Tradicional', 'Pedicure Tradicional');

INSERT INTO public.professional_services (professional_id, service_id, company_id, created_at)
SELECT p.id, s.id, p.company_id, now()
FROM public.professionals p JOIN public.services s ON s.company_id = p.company_id
WHERE p.full_name = 'Carlos Oliveira' AND s.name IN ('Corte Feminino', 'Escova Modelada');

-- CLIENTES DEMO
INSERT INTO public.clients (id, company_id, full_name, cpf, phone, whatsapp, email, birth_date, address, city, state, zip_code, notes, status, total_spent, appointments_count, last_appointment_at, first_appointment_at, created_at, updated_at, deleted_at) VALUES
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 'Maria Silva', '123.456.789-00', '(11) 99999-9999', '(11) 99999-9999', 'maria@email.com', '1990-05-15', 'Rua das Flores, 123', 'Sao Paulo', 'SP', '01001-000', 'Cliente VIP, prefere horarios da manha', 'active', 0, 0, NULL, NULL, now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 'Joao Santos', '987.654.321-00', '(11) 98888-8888', '(11) 98888-8888', 'joao@email.com', '1985-08-20', 'Av. Brasil, 456', 'Sao Paulo', 'SP', '01002-000', NULL, 'active', 0, 0, NULL, NULL, now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 'Ana Costa', '456.789.123-00', '(11) 97777-7777', '(11) 97777-7777', 'ana@email.com', '1992-12-10', 'Rua Augusta, 789', 'Sao Paulo', 'SP', '01003-000', 'Alergica a determinados produtos', 'active', 0, 0, NULL, NULL, now(), now(), NULL);

-- HORARIOS FUNCIONAMENTO EMPRESA (seg-sex 08-18, sab 08-12, dom fechado)
INSERT INTO public.business_hours (id, company_id, day_of_week, is_open, open_time, close_time, break_start, break_end, created_at, updated_at) VALUES
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 0, false, NULL, NULL, NULL, NULL, now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 1, true, '08:00:00', '18:00:00', '12:00:00', '13:00:00', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 2, true, '08:00:00', '18:00:00', '12:00:00', '13:00:00', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 3, true, '08:00:00', '18:00:00', '12:00:00', '13:00:00', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 4, true, '08:00:00', '18:00:00', '12:00:00', '13:00:00', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 5, true, '08:00:00', '18:00:00', '12:00:00', '13:00:00', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 6, true, '08:00:00', '12:00:00', NULL, NULL, now(), now());

-- HORARIOS PROFISSIONAIS (igual empresa)
INSERT INTO public.professional_hours (id, professional_id, company_id, day_of_week, is_open, open_time, close_time, break_start, break_end, created_at, updated_at)
SELECT gen_random_uuid(), p.id, p.company_id, 0, false, NULL, NULL, NULL, NULL, now(), now()
FROM public.professionals p WHERE p.company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella');

INSERT INTO public.professional_hours (id, professional_id, company_id, day_of_week, is_open, open_time, close_time, break_start, break_end, created_at, updated_at)
SELECT gen_random_uuid(), p.id, p.company_id, d.day, true, '08:00:00', '18:00:00', '12:00:00', '13:00:00', now(), now()
FROM public.professionals p CROSS JOIN (SELECT generate_series(1, 5) AS day) d
WHERE p.company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella');

INSERT INTO public.professional_hours (id, professional_id, company_id, day_of_week, is_open, open_time, close_time, break_start, break_end, created_at, updated_at)
SELECT gen_random_uuid(), p.id, p.company_id, 6, true, '08:00:00', '12:00:00', NULL, NULL, now(), now()
FROM public.professionals p WHERE p.company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella');

-- AGENDAMENTOS DEMO (3 status diferentes)
INSERT INTO public.appointments (id, company_id, client_id, professional_id, service_id, date, start_time, end_time, duration_minutes, price, discount, final_price, notes, status, payment_method, payment_status, created_by, updated_by, created_at, updated_at, deleted_at) VALUES
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.clients WHERE full_name = 'Maria Silva' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.professionals WHERE full_name = 'Ana Silva' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.services WHERE name = 'Corte Feminino' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    CURRENT_DATE + INTERVAL '1 day', '09:00:00', '10:00:00', 60, 80.00, 0, 80.00,
    'Cliente prefere corte em camadas', 'pending', NULL, NULL, NULL, NULL, now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.clients WHERE full_name = 'Joao Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.professionals WHERE full_name = 'Juliana Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.services WHERE name = 'Manicure Tradicional' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    CURRENT_DATE + INTERVAL '1 day', '14:00:00', '15:00:00', 60, 50.00, 0, 50.00,
    NULL, 'confirmed', 'pix', 'paid', NULL, NULL, now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.clients WHERE full_name = 'Ana Costa' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.professionals WHERE full_name = 'Carlos Oliveira' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.services WHERE name = 'Escova Modelada' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    CURRENT_DATE - INTERVAL '1 day', '10:00:00', '10:45:00', 45, 60.00, 5.00, 55.00,
    'Desconto promocional de primeira visita', 'completed', 'dinheiro', 'paid', NULL, NULL, now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.clients WHERE full_name = 'Maria Silva' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.professionals WHERE full_name = 'Juliana Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.services WHERE name = 'Pedicure Tradicional' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    CURRENT_DATE - INTERVAL '3 days', '15:00:00', '16:15:00', 75, 60.00, 0, 60.00,
    NULL, 'completed', 'credito', 'paid', NULL, NULL, now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.clients WHERE full_name = 'Joao Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.professionals WHERE full_name = 'Ana Silva' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.services WHERE name = 'Corte Feminino' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    CURRENT_DATE + INTERVAL '3 days', '11:00:00', '12:00:00', 60, 80.00, 0, 80.00,
    'Cancelado por motivo pessoal', 'cancelled', NULL, NULL, NULL, NULL, now(), now(), NULL);

-- VENDAS DEMO (3 vendas de agendamentos concluidos + 1 pacote avulso)
INSERT INTO public.sales (id, company_id, client_id, professional_id, appointment_id, date, gross_amount, discount, net_amount, status, notes, created_by, created_at, updated_at, deleted_at) VALUES
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.clients WHERE full_name = 'Ana Costa' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.professionals WHERE full_name = 'Carlos Oliveira' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.appointments WHERE status = 'completed' AND client_id = (SELECT id FROM public.clients WHERE full_name = 'Ana Costa' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella'))),
    CURRENT_DATE - INTERVAL '1 day', 60.00, 5.00, 55.00, 'completed', 'Venda do agendamento de escova modelada', NULL, now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.clients WHERE full_name = 'Maria Silva' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.professionals WHERE full_name = 'Juliana Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.appointments WHERE status = 'completed' AND client_id = (SELECT id FROM public.clients WHERE full_name = 'Maria Silva' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella'))),
    CURRENT_DATE - INTERVAL '3 days', 60.00, 0.00, 60.00, 'completed', 'Venda do agendamento de pedicure', NULL, now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.clients WHERE full_name = 'Joao Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.professionals WHERE full_name = 'Juliana Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    NULL, CURRENT_DATE - INTERVAL '2 days', 95.00, 0.00, 95.00, 'completed', 'Pacote manicure + design sobrancelhas', NULL, now(), now(), NULL);

-- SALE ITEMS (itens da venda avulsa de pacote)
INSERT INTO public.sale_items (id, sale_id, company_id, service_id, description, quantity, unit_price, total_price, professional_id, created_at) VALUES
  (gen_random_uuid(), (SELECT id FROM public.sales WHERE notes LIKE '%Pacote manicure%'),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.services WHERE name = 'Manicure Tradicional' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    'Manicure Tradicional', 1, 50.00, 50.00,
    (SELECT id FROM public.professionals WHERE full_name = 'Juliana Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')), now()),
  (gen_random_uuid(), (SELECT id FROM public.sales WHERE notes LIKE '%Pacote manicure%'),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.services WHERE name = 'Design de Sobrancelhas' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    'Design de Sobrancelhas', 1, 45.00, 45.00,
    (SELECT id FROM public.professionals WHERE full_name = 'Juliana Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')), now());

-- ITENS DE VENDA para vendas que vem de agendamento (1:1 com serviço)
INSERT INTO public.sale_items (id, sale_id, company_id, service_id, description, quantity, unit_price, total_price, professional_id, created_at)
SELECT gen_random_uuid(), s.id, s.company_id, sv.id, sv.name, 1, sv.price, s.net_amount, s.professional_id, now()
FROM public.sales s
JOIN public.services sv ON sv.id = (SELECT service_id FROM public.appointments WHERE id = s.appointment_id)
WHERE s.appointment_id IS NOT NULL;

-- PAYMENTS
INSERT INTO public.payments (id, sale_id, company_id, amount, method, status, paid_at, transaction_id, notes, created_at) VALUES
  (gen_random_uuid(), (SELECT id FROM public.sales WHERE net_amount = 55.00),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    55.00, 'dinheiro', 'paid', CURRENT_DATE - INTERVAL '1 day', NULL, 'Pagamento em dinheiro no local', now()),
  (gen_random_uuid(), (SELECT id FROM public.sales WHERE net_amount = 60.00 AND notes LIKE '%pedicure%'),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    60.00, 'credito', 'paid', CURRENT_DATE - INTERVAL '3 days', 'STP123456789', 'Cartao de credito Visa 4x', now()),
  (gen_random_uuid(), (SELECT id FROM public.sales WHERE net_amount = 95.00),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    95.00, 'pix', 'paid', CURRENT_DATE - INTERVAL '2 days', 'PIX987654321', 'PIX pago via aplicativo', now());

-- COMMISSIONS (3 comissoes pendentes baseadas no % cadastrada)
INSERT INTO public.commissions (id, company_id, professional_id, sale_id, appointment_id, amount, status, paid_at, period_reference, notes, created_at, updated_at) VALUES
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.professionals WHERE full_name = 'Carlos Oliveira' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.sales WHERE net_amount = 55.00),
    (SELECT id FROM public.appointments WHERE status = 'completed' AND client_id = (SELECT id FROM public.clients WHERE full_name = 'Ana Costa' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella'))),
    ROUND(55.00 * 0.25, 2), 'pending', NULL, to_char(CURRENT_DATE - INTERVAL '1 day', 'YYYY-MM'), '25% de comissao sobre R$55.00', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.professionals WHERE full_name = 'Juliana Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.sales WHERE notes LIKE '%pedicure%'),
    (SELECT id FROM public.appointments WHERE status = 'completed' AND client_id = (SELECT id FROM public.clients WHERE full_name = 'Maria Silva' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella'))),
    ROUND(60.00 * 0.30, 2), 'pending', NULL, to_char(CURRENT_DATE - INTERVAL '3 days', 'YYYY-MM'), '30% de comissao sobre R$60.00', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.professionals WHERE full_name = 'Juliana Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.sales WHERE net_amount = 95.00), NULL,
    ROUND(95.00 * 0.30, 2), 'pending', NULL, to_char(CURRENT_DATE - INTERVAL '2 days', 'YYYY-MM'), '30% de comissao sobre R$95.00 (pacote)', now(), now());

-- ATUALIZA KPIs DOS CLIENTES (total gasto, qtd atendimentos, ultimo/primeiro atendimento)
UPDATE public.clients c SET
  total_spent = (
    SELECT COALESCE(SUM(s.net_amount), 0) FROM public.sales s
    WHERE s.client_id = c.id AND s.status = 'completed' AND s.deleted_at IS NULL
  ),
  appointments_count = (
    SELECT COUNT(*) FROM public.appointments a
    WHERE a.client_id = c.id AND a.status != 'cancelled' AND a.deleted_at IS NULL
  ),
  first_appointment_at = (
    SELECT MIN(a.created_at) FROM public.appointments a
    WHERE a.client_id = c.id AND a.deleted_at IS NULL
  ),
  last_appointment_at = (
    SELECT MAX(a.created_at) FROM public.appointments a
    WHERE a.client_id = c.id AND a.deleted_at IS NULL
  ),
  updated_at = now();

-- ============================================================================
-- FIM DO SCRIPT!
-- ============================================================================
-- Apos executar:
-- 1. Crie sua primeira conta em /cadastro
-- 2. Acesse o painel Supabase → Authentication → Users → encontre seu usuario
-- 3. Clique em "User metadata" → adicione {"role":"admin_empresa"}
-- 4. OU crie um perfil associado na tabela public.profiles com role = 'super_admin'
-- 5. Pronto! Acesse /login, logue, sera redirecionado para /setup (onboarding 6 passos)
-- ============================================================================
