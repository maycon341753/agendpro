-- ============================================================================
--  PATCH DE CORRECAO - ERRO: column "p.email" does not exist
-- ============================================================================
--  Motivo: A tabela public.profiles NAO tem coluna "email" (apenas phone, whatsapp).
--  O email fica na tabela nativa auth.users(email) do Supabase.
--
--  COMO USAR:
--  1. Acesse o SQL Editor do seu Supabase: https://supabase.com/dashboard/project/ixwdnrvgtdcdljqtgfzb/sql/new
--  2. Cole TODO o conteudo deste arquivo e clique em RUN (▶)
--  3. Nao precisa rodar o script completo de novo! Apenas este PATCH.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PASSO 1: Funcao helper segura para obter o email do usuario logado
-- (Le auth.users(email) com SECURITY DEFINER — pois usuarios normais nao
--  podem ler auth.users diretamente)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- PASSO 2: CORRIGIR POLICY clients_select_self
-- (Remove referencia p.email e usa auth_email() OU compara com users.email)
-- ----------------------------------------------------------------------------
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
          -- Compara email vindo de auth.users.email com clients.email
          OR public.auth_email() = clients.email::TEXT
        )
    )
  );

-- ----------------------------------------------------------------------------
-- PASSO 3: CORRIGIR POLICY appointments_select_client
-- (Mesma correcao: p.email -> auth_email())
-- ----------------------------------------------------------------------------
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
        OR public.auth_email() = c.email::TEXT
      )
      WHERE c.id = appointments.client_id
        AND p.id = auth.uid()
        AND p.role = 'cliente'
    )
  );

-- ----------------------------------------------------------------------------
-- PASSO 4 (OPCIONAL mas recomendado): Adicionar coluna email em public.profiles
-- Evita repetir a chamada a auth.users toda vez. Se preferir, execute abaixo:
-- (Descomente as 5 linhas seguintes se quiser adicionar a coluna permanentemente)
-- ----------------------------------------------------------------------------
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email CITEXT;
-- CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
-- -- Copia emails ja existentes do auth para profiles:
-- UPDATE public.profiles p SET email = (SELECT email FROM auth.users u WHERE u.id = p.id) WHERE p.email IS NULL;

-- ============================================================================
--  FIM DO PATCH
-- ============================================================================
--  Agora o script completo nao vai mais dar erro de "column p.email does not exist".
--  Se VOCE JA RODOU PARTE do SCRIPT_COMPLETO e deu erro no meio (na policy clients),
--  rode este PATCH, e depois rode a PARTIR DA LINHA onde parou (após a policy
--  clients_select_self), OU simplesmente rode o SCRIPT_COMPLETO_SUPABASE.sql
--  NOVAMENTE do inicio (tudo tem IF NOT EXISTS entao nao duplica nada).
-- ============================================================================
