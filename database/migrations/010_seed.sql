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
SELECT r.id, p.id, now()
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'super_admin';

INSERT INTO public.role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, now()
FROM public.roles r
JOIN public.permissions p ON p.name IN (
  'dashboard.view', 'appointments.create', 'appointments.edit',
  'clients.manage', 'services.manage', 'professionals.manage',
  'sales.view', 'finance.view', 'reports.view', 'settings.manage'
)
WHERE r.name = 'admin_empresa';

INSERT INTO public.role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, now()
FROM public.roles r
JOIN public.permissions p ON p.name IN (
  'dashboard.view', 'appointments.create', 'appointments.edit',
  'clients.manage', 'services.manage', 'professionals.manage',
  'sales.view', 'reports.view'
)
WHERE r.name = 'gerente';

INSERT INTO public.role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, now()
FROM public.roles r
JOIN public.permissions p ON p.name IN (
  'dashboard.view', 'appointments.create', 'appointments.edit',
  'clients.manage', 'sales.view'
)
WHERE r.name = 'recepcionista';

INSERT INTO public.role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, now()
FROM public.roles r
JOIN public.permissions p ON p.name IN (
  'dashboard.view', 'sales.view'
)
WHERE r.name = 'profissional';

INSERT INTO public.role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, now()
FROM public.roles r
JOIN public.permissions p ON p.name IN ('dashboard.view')
WHERE r.name = 'cliente';

INSERT INTO public.plans (id, name, slug, price_monthly, price_yearly, description, features, limits, is_active, created_at) VALUES
  (
    gen_random_uuid(),
    'Gratuito',
    'gratuito',
    0.00,
    0.00,
    '{"pt-BR": "Plano basico gratuito para comecar"}'::jsonb,
    '["1 profissional", "50 agendamentos/mes", "Suporte por email"]'::jsonb,
    '{"professionals": 1, "appointments_monthly": 50, "storage_mb": 100}'::jsonb,
    true,
    now()
  ),
  (
    gen_random_uuid(),
    'Basico',
    'basico',
    79.00,
    790.00,
    '{"pt-BR": "Plano basico para pequenos negocios"}'::jsonb,
    '["3 profissionais", "Agendamentos ilimitados", "Suporte prioritario", "WhatsApp integrado"]'::jsonb,
    '{"professionals": 3, "appointments_monthly": -1, "storage_mb": 500}'::jsonb,
    true,
    now()
  ),
  (
    gen_random_uuid(),
    'Profissional',
    'profissional',
    149.00,
    1490.00,
    '{"pt-BR": "Plano profissional para negocios em crescimento"}'::jsonb,
    '["10 profissionais", "Agendamentos ilimitados", "Suporte VIP", "Todas integracoes", "Relatorios avancados"]'::jsonb,
    '{"professionals": 10, "appointments_monthly": -1, "storage_mb": 2000}'::jsonb,
    true,
    now()
  ),
  (
    gen_random_uuid(),
    'Enterprise',
    'enterprise',
    0.00,
    0.00,
    '{"pt-BR": "Plano customizado para grandes empresas"}'::jsonb,
    '["Profissionais ilimitados", "Suporte dedicado", "Integracoes customizadas", "SLA garantido", "Onboarding dedicado"]'::jsonb,
    '{"professionals": -1, "appointments_monthly": -1, "storage_mb": -1}'::jsonb,
    true,
    now()
  );

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
  now(),
  now(),
  NULL;

INSERT INTO public.service_categories (id, company_id, name, description, sort_order, created_at, updated_at, deleted_at) VALUES
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 'Cabelo', 'Servicos de cabelo como corte, escova, coloracao', 1, now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 'Unhas', 'Servicos de manicure e pedicure', 2, now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 'Estetica', 'Tratamentos esteticos e design de sobrancelhas', 3, now(), now(), NULL);

INSERT INTO public.services (id, company_id, category_id, name, description, price, duration_minutes, image_url, status, created_at, updated_at, deleted_at) VALUES
  (
    gen_random_uuid(),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.service_categories WHERE name = 'Cabelo' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    'Corte Feminino',
    'Corte profissional com lavagem e finalizacao',
    80.00,
    60,
    NULL,
    'active',
    now(),
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.service_categories WHERE name = 'Cabelo' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    'Escova Modelada',
    'Escova modelada com produtos de qualidade',
    60.00,
    45,
    NULL,
    'active',
    now(),
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.service_categories WHERE name = 'Unhas' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    'Manicure Tradicional',
    'Cuidado com as unhas das maos, corte, lixamento e esmalte',
    50.00,
    60,
    NULL,
    'active',
    now(),
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.service_categories WHERE name = 'Unhas' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    'Pedicure Tradicional',
    'Cuidado completo com os pes, unhas e hidratacao',
    60.00,
    75,
    NULL,
    'active',
    now(),
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.service_categories WHERE name = 'Estetica' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    'Design de Sobrancelhas',
    'Design personalizado com henna ou tintura',
    45.00,
    30,
    NULL,
    'active',
    now(),
    now(),
    NULL
  );

INSERT INTO public.professionals (id, company_id, user_id, full_name, avatar_url, specialty, phone, email, commission_type, commission_value, status, created_at, updated_at, deleted_at) VALUES
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), NULL, 'Ana Silva', NULL, 'Cabelo', '(11) 98888-1111', 'ana@studiobella.com.br', 'percent', 30.00, 'active', now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), NULL, 'Juliana Santos', NULL, 'Unhas', '(11) 98888-2222', 'juliana@studiobella.com.br', 'percent', 30.00, 'active', now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), NULL, 'Carlos Oliveira', NULL, 'Cabelo', '(11) 98888-3333', 'carlos@studiobella.com.br', 'percent', 25.00, 'active', now(), now(), NULL);

INSERT INTO public.professional_services (professional_id, service_id, company_id, created_at)
SELECT p.id, s.id, p.company_id, now()
FROM public.professionals p
JOIN public.services s ON s.company_id = p.company_id
WHERE p.full_name = 'Ana Silva'
  AND s.name IN ('Corte Feminino', 'Escova Modelada');

INSERT INTO public.professional_services (professional_id, service_id, company_id, created_at)
SELECT p.id, s.id, p.company_id, now()
FROM public.professionals p
JOIN public.services s ON s.company_id = p.company_id
WHERE p.full_name = 'Juliana Santos'
  AND s.name IN ('Manicure Tradicional', 'Pedicure Tradicional');

INSERT INTO public.professional_services (professional_id, service_id, company_id, created_at)
SELECT p.id, s.id, p.company_id, now()
FROM public.professionals p
JOIN public.services s ON s.company_id = p.company_id
WHERE p.full_name = 'Carlos Oliveira'
  AND s.name IN ('Corte Feminino', 'Escova Modelada');

INSERT INTO public.clients (id, company_id, full_name, cpf, phone, whatsapp, email, birth_date, address, city, state, zip_code, notes, status, total_spent, appointments_count, last_appointment_at, first_appointment_at, created_at, updated_at, deleted_at) VALUES
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 'Maria Silva', '123.456.789-00', '(11) 99999-9999', '(11) 99999-9999', 'maria@email.com', '1990-05-15', 'Rua das Flores, 123', 'Sao Paulo', 'SP', '01001-000', 'Cliente VIP, prefere horarios da manha', 'active', 0, 0, NULL, NULL, now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 'Joao Santos', '987.654.321-00', '(11) 98888-8888', '(11) 98888-8888', 'joao@email.com', '1985-08-20', 'Av. Brasil, 456', 'Sao Paulo', 'SP', '01002-000', NULL, 'active', 0, 0, NULL, NULL, now(), now(), NULL),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 'Ana Costa', '456.789.123-00', '(11) 97777-7777', '(11) 97777-7777', 'ana@email.com', '1992-12-10', 'Rua Augusta, 789', 'Sao Paulo', 'SP', '01003-000', 'Alergica a determinados produtos', 'active', 0, 0, NULL, NULL, now(), now(), NULL);

INSERT INTO public.business_hours (id, company_id, day_of_week, is_open, open_time, close_time, break_start, break_end, created_at, updated_at) VALUES
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 0, false, NULL, NULL, NULL, NULL, now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 1, true, '08:00:00', '18:00:00', '12:00:00', '13:00:00', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 2, true, '08:00:00', '18:00:00', '12:00:00', '13:00:00', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 3, true, '08:00:00', '18:00:00', '12:00:00', '13:00:00', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 4, true, '08:00:00', '18:00:00', '12:00:00', '13:00:00', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 5, true, '08:00:00', '18:00:00', '12:00:00', '13:00:00', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.companies WHERE slug = 'studio-bella'), 6, true, '08:00:00', '12:00:00', NULL, NULL, now(), now());

INSERT INTO public.professional_hours (id, professional_id, company_id, day_of_week, is_open, open_time, close_time, break_start, break_end, created_at, updated_at)
SELECT
  gen_random_uuid(),
  p.id,
  p.company_id,
  0, false, NULL, NULL, NULL, NULL, now(), now()
FROM public.professionals p
WHERE p.company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella');

INSERT INTO public.professional_hours (id, professional_id, company_id, day_of_week, is_open, open_time, close_time, break_start, break_end, created_at, updated_at)
SELECT
  gen_random_uuid(),
  p.id,
  p.company_id,
  d.day,
  true,
  '08:00:00',
  '18:00:00',
  '12:00:00',
  '13:00:00',
  now(),
  now()
FROM public.professionals p
CROSS JOIN (SELECT generate_series(1, 5) AS day) d
WHERE p.company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella');

INSERT INTO public.professional_hours (id, professional_id, company_id, day_of_week, is_open, open_time, close_time, break_start, break_end, created_at, updated_at)
SELECT
  gen_random_uuid(),
  p.id,
  p.company_id,
  6,
  true,
  '08:00:00',
  '12:00:00',
  NULL,
  NULL,
  now(),
  now()
FROM public.professionals p
WHERE p.company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella');

INSERT INTO public.appointments (id, company_id, client_id, professional_id, service_id, date, start_time, end_time, duration_minutes, price, discount, final_price, notes, status, payment_method, payment_status, created_by, updated_by, created_at, updated_at, deleted_at) VALUES
  (
    gen_random_uuid(),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.clients WHERE full_name = 'Maria Silva' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.professionals WHERE full_name = 'Ana Silva' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.services WHERE name = 'Corte Feminino' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    CURRENT_DATE + INTERVAL '1 day',
    '09:00:00',
    '10:00:00',
    60,
    80.00,
    0,
    80.00,
    'Cliente prefere corte em camadas',
    'pending',
    NULL,
    NULL,
    NULL,
    NULL,
    now(),
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.clients WHERE full_name = 'Joao Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.professionals WHERE full_name = 'Juliana Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.services WHERE name = 'Manicure Tradicional' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    CURRENT_DATE + INTERVAL '1 day',
    '14:00:00',
    '15:00:00',
    60,
    50.00,
    0,
    50.00,
    NULL,
    'confirmed',
    'pix',
    'paid',
    NULL,
    NULL,
    now(),
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.clients WHERE full_name = 'Ana Costa' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.professionals WHERE full_name = 'Carlos Oliveira' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.services WHERE name = 'Escova Modelada' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    CURRENT_DATE - INTERVAL '1 day',
    '10:00:00',
    '10:45:00',
    45,
    60.00,
    5.00,
    55.00,
    'Desconto promocional de primeira visita',
    'completed',
    'dinheiro',
    'paid',
    NULL,
    NULL,
    now(),
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.clients WHERE full_name = 'Maria Silva' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.professionals WHERE full_name = 'Juliana Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.services WHERE name = 'Pedicure Tradicional' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    CURRENT_DATE - INTERVAL '3 days',
    '15:00:00',
    '16:15:00',
    75,
    60.00,
    0,
    60.00,
    NULL,
    'completed',
    'credito',
    'paid',
    NULL,
    NULL,
    now(),
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.clients WHERE full_name = 'Joao Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.professionals WHERE full_name = 'Ana Silva' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.services WHERE name = 'Corte Feminino' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    CURRENT_DATE + INTERVAL '3 days',
    '11:00:00',
    '12:00:00',
    60,
    80.00,
    0,
    80.00,
    'Cancelado por motivo pessoal',
    'cancelled',
    NULL,
    NULL,
    NULL,
    NULL,
    now(),
    now(),
    NULL
  );

INSERT INTO public.sales (id, company_id, client_id, professional_id, appointment_id, date, gross_amount, discount, net_amount, status, notes, created_by, created_at, updated_at, deleted_at) VALUES
  (
    gen_random_uuid(),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.clients WHERE full_name = 'Ana Costa' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.professionals WHERE full_name = 'Carlos Oliveira' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.appointments WHERE status = 'completed' AND client_id = (SELECT id FROM public.clients WHERE full_name = 'Ana Costa' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella'))),
    CURRENT_DATE - INTERVAL '1 day',
    60.00,
    5.00,
    55.00,
    'completed',
    'Venda do agendamento de escova modelada',
    NULL,
    now(),
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.clients WHERE full_name = 'Maria Silva' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.professionals WHERE full_name = 'Juliana Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.appointments WHERE status = 'completed' AND client_id = (SELECT id FROM public.clients WHERE full_name = 'Maria Silva' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella'))),
    CURRENT_DATE - INTERVAL '3 days',
    60.00,
    0.00,
    60.00,
    'completed',
    'Venda do agendamento de pedicure',
    NULL,
    now(),
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.clients WHERE full_name = 'Joao Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.professionals WHERE full_name = 'Juliana Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    NULL,
    CURRENT_DATE - INTERVAL '2 days',
    95.00,
    0.00,
    95.00,
    'completed',
    'Pacote manicure + design sobrancelhas',
    NULL,
    now(),
    now(),
    NULL
  );

INSERT INTO public.sale_items (id, sale_id, company_id, service_id, description, quantity, unit_price, total_price, professional_id, created_at)
SELECT
  gen_random_uuid(),
  s.id,
  s.company_id,
  sv.id,
  sv.name,
  1,
  sv.price,
  s.net_amount,
  s.professional_id,
  now()
FROM public.sales s
JOIN public.services sv ON sv.id = (SELECT service_id FROM public.appointments WHERE id = s.appointment_id)
WHERE s.appointment_id IS NOT NULL;

INSERT INTO public.sale_items (id, sale_id, company_id, service_id, description, quantity, unit_price, total_price, professional_id, created_at) VALUES
  (
    gen_random_uuid(),
    (SELECT id FROM public.sales WHERE notes LIKE '%Pacote manicure%'),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.services WHERE name = 'Manicure Tradicional' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    'Manicure Tradicional',
    1,
    50.00,
    50.00,
    (SELECT id FROM public.professionals WHERE full_name = 'Juliana Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    now()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.sales WHERE notes LIKE '%Pacote manicure%'),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.services WHERE name = 'Design de Sobrancelhas' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    'Design de Sobrancelhas',
    1,
    45.00,
    45.00,
    (SELECT id FROM public.professionals WHERE full_name = 'Juliana Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    now()
  );

INSERT INTO public.payments (id, sale_id, company_id, amount, method, status, paid_at, transaction_id, notes, created_at) VALUES
  (
    gen_random_uuid(),
    (SELECT id FROM public.sales WHERE net_amount = 55.00),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    55.00,
    'dinheiro',
    'paid',
    CURRENT_DATE - INTERVAL '1 day',
    NULL,
    'Pagamento em dinheiro no local',
    now()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.sales WHERE net_amount = 60.00 AND notes LIKE '%pedicure%'),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    60.00,
    'credito',
    'paid',
    CURRENT_DATE - INTERVAL '3 days',
    'STP123456789',
    'Cartao de credito Visa 4x',
    now()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.sales WHERE net_amount = 95.00),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    95.00,
    'pix',
    'paid',
    CURRENT_DATE - INTERVAL '2 days',
    'PIX987654321',
    'PIX pago via aplicativo',
    now()
  );

INSERT INTO public.commissions (id, company_id, professional_id, sale_id, appointment_id, amount, status, paid_at, period_reference, notes, created_at, updated_at) VALUES
  (
    gen_random_uuid(),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.professionals WHERE full_name = 'Carlos Oliveira' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.sales WHERE net_amount = 55.00),
    (SELECT id FROM public.appointments WHERE status = 'completed' AND client_id = (SELECT id FROM public.clients WHERE full_name = 'Ana Costa' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella'))),
    ROUND(55.00 * 0.25, 2),
    'pending',
    NULL,
    to_char(CURRENT_DATE - INTERVAL '1 day', 'YYYY-MM'),
    '25% de comissao sobre R$55.00',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.professionals WHERE full_name = 'Juliana Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.sales WHERE notes LIKE '%pedicure%'),
    (SELECT id FROM public.appointments WHERE status = 'completed' AND client_id = (SELECT id FROM public.clients WHERE full_name = 'Maria Silva' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella'))),
    ROUND(60.00 * 0.30, 2),
    'pending',
    NULL,
    to_char(CURRENT_DATE - INTERVAL '3 days', 'YYYY-MM'),
    '30% de comissao sobre R$60.00',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM public.companies WHERE slug = 'studio-bella'),
    (SELECT id FROM public.professionals WHERE full_name = 'Juliana Santos' AND company_id = (SELECT id FROM public.companies WHERE slug = 'studio-bella')),
    (SELECT id FROM public.sales WHERE net_amount = 95.00),
    NULL,
    ROUND(95.00 * 0.30, 2),
    'pending',
    NULL,
    to_char(CURRENT_DATE - INTERVAL '2 days', 'YYYY-MM'),
    '30% de comissao sobre R$95.00 (pacote)',
    now(),
    now()
  );

UPDATE public.clients c SET
  total_spent = (
    SELECT COALESCE(SUM(s.net_amount), 0)
    FROM public.sales s
    WHERE s.client_id = c.id AND s.status = 'completed' AND s.deleted_at IS NULL
  ),
  appointments_count = (
    SELECT COUNT(*)
    FROM public.appointments a
    WHERE a.client_id = c.id AND a.status != 'cancelled' AND a.deleted_at IS NULL
  ),
  first_appointment_at = (
    SELECT MIN(a.created_at)
    FROM public.appointments a
    WHERE a.client_id = c.id AND a.deleted_at IS NULL
  ),
  last_appointment_at = (
    SELECT MAX(a.created_at)
    FROM public.appointments a
    WHERE a.client_id = c.id AND a.deleted_at IS NULL
  ),
  updated_at = now();
