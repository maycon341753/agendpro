-- ============================================================================
-- PATCH_CORRECAO_LOGIN_CADASTRO.sql
-- Aplicar em: Supabase → SQL Editor → New query → Colar → Run
-- Objetivos:
--   (1) Garantir RLS e policies para tables profiles / company_users / companies
--   (2) Trigger: após criar usuário auth.users → inserir linha em public.profiles
--   (3) Garantir coluna email em public.profiles
-- ============================================================================

-- ============================================================================
-- 1. GARANTIR COLUNAS EM public.companies (NÃO CRASHAR se coluna faltar)
--    Tratar casos onde o banco foi criado com schema antigo/parcial
-- ============================================================================
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS trade_name TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS document TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS email CITEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS primary_color TEXT NOT NULL DEFAULT '#2563eb';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS secondary_color TEXT NOT NULL DEFAULT '#10b981';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS color_primary TEXT NOT NULL DEFAULT '#2563eb';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS color_secondary TEXT NOT NULL DEFAULT '#10b981';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS slug CITEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.plans(id);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Copiar valores de primary_color → color_primary (alias suportado)
UPDATE public.companies SET color_primary = primary_color WHERE color_primary IS NULL AND primary_color IS NOT NULL;
UPDATE public.companies SET color_secondary = secondary_color WHERE color_secondary IS NULL AND secondary_color IS NOT NULL;
UPDATE public.companies SET primary_color = color_primary WHERE primary_color IS NULL AND color_primary IS NOT NULL;
UPDATE public.companies SET secondary_color = color_secondary WHERE secondary_color IS NULL AND color_secondary IS NOT NULL;

-- ============================================================================
-- 1b. GARANTIR COLUNAS EM public.company_users
-- ============================================================================
ALTER TABLE public.company_users ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);
ALTER TABLE public.company_users ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.company_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.company_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.company_users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ============================================================================
-- 1c. ADICIONAR COLUNAS EM public.profiles (se não existir)
-- ============================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email CITEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'cliente';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ============================================================================
-- 2. RLS: Habilitar RLS em tabelas essenciais (se ainda não habilitado)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. FUNÇÃO HELPER: current_user_id()
-- ============================================================================
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- 4. POLICIES: profiles
--    Usuário só pode VER / EDITAR o SEU perfil
-- ============================================================================
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own
  ON public.profiles FOR SELECT
  USING (id = public.current_user_id());

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own
  ON public.profiles FOR INSERT
  WITH CHECK (id = public.current_user_id());

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE
  USING (id = public.current_user_id());

-- ============================================================================
-- 5. POLICIES: company_users
--    Usuário pode VER apenas company_users onde user_id = ele mesmo
-- ============================================================================
DROP POLICY IF EXISTS company_users_select_own ON public.company_users;
CREATE POLICY company_users_select_own
  ON public.company_users FOR SELECT
  USING (user_id = public.current_user_id());

DROP POLICY IF EXISTS company_users_insert_own ON public.company_users;
CREATE POLICY company_users_insert_own
  ON public.company_users FOR INSERT
  WITH CHECK (user_id = public.current_user_id());

-- ============================================================================
-- 6. POLICIES: companies
--    Usuário pode VER companies onde ele está na company_users (JOIN)
-- ============================================================================
DROP POLICY IF EXISTS companies_select_member ON public.companies;
CREATE POLICY companies_select_member
  ON public.companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users cu
      WHERE cu.company_id = public.companies.id
        AND cu.user_id = public.current_user_id()
        AND cu.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS companies_insert_own ON public.companies;
CREATE POLICY companies_insert_own
  ON public.companies FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS companies_update_owner ON public.companies;
CREATE POLICY companies_update_owner
  ON public.companies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users cu
      WHERE cu.company_id = public.companies.id
        AND cu.user_id = public.current_user_id()
        AND cu.role IN ('owner', 'admin')
        AND cu.deleted_at IS NULL
    )
  );

-- ============================================================================
-- 7. TRIGGER: Criar perfil automaticamente após auth.users criado
--    (caso o pages/cadastro.js falhe, esse trigger garante a linha)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'cliente')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 8. DAR PERMISSÕES PARA authenticated / anon
-- ============================================================================
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.company_users TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.companies TO authenticated, anon;

-- ============================================================================
-- FIM DO PATCH
-- Como rodar:
--   1. Abra https://supabase.com/dashboard/project/ixwdnrvgtdcdljqtgfzb/sql/new
--   2. Copie TODO este arquivo e cole
--   3. Clique em "Run" (botão verde no canto inferior esquerdo)
--   4. Pronto! Agora teste cadastro e login.
-- ============================================================================
