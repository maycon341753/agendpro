-- ============================================================================
--  PATCH DE CORRECAO - ERRO: record "new" has no field "company_id"
-- ============================================================================
--  Motivo: A trigger audit_trigger_func() tenta acessar NEW.company_id
--  na tabela companies (que NAO TEM essa coluna; sua PK e "id").
--  E o CASE WHEN com OLD.id falha no INSERT (OLD = NULL em INSERT).
--
--  COMO USAR:
--  1. Acesse o SQL Editor: https://supabase.com/dashboard/project/ixwdnrvgtdcdljqtgfzb/sql/new
--  2. Copie TODO este arquivo -> Cole -> Clique RUN (▶)
--  3. Pronto! Agora pode continuar rodando SCRIPT_COMPLETO do começo novamente (seguro)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) CORRIGE FUNCAO audit_trigger_func com tratamento correto INSERT/UPDATE/DELETE
--    separado, e regra especial para companies (id = company_id)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  action_text TEXT;
  company_uuid UUID;
  entity_id_val UUID;
BEGIN
  -- Define action + old_data + new_data
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

  -- Regra company_id por TIPO DE OPERACAO + TABELA
  IF TG_ARGV[0] = 'companies' THEN
    -- TABELA companies (nao tem coluna company_id; a PK id E O company_id)
    IF TG_OP = 'INSERT' THEN
      company_uuid := NEW.id;
    ELSIF TG_OP = 'UPDATE' THEN
      company_uuid := COALESCE(NEW.id, OLD.id);
    ELSE -- DELETE
      company_uuid := OLD.id;
    END IF;
  ELSE
    -- DEMAIS TABELAS (tem coluna company_id: appointments, services, clients, professionals, sales)
    IF TG_OP = 'INSERT' THEN
      company_uuid := NEW.company_id;
    ELSIF TG_OP = 'UPDATE' THEN
      company_uuid := COALESCE(NEW.company_id, OLD.company_id);
    ELSE -- DELETE
      company_uuid := OLD.company_id;
    END IF;
  END IF;

  -- entity_id = id da linha (NEW.id em INSERT/UPDATE, OLD.id em DELETE)
  IF TG_OP = 'DELETE' THEN
    entity_id_val := OLD.id;
  ELSE
    entity_id_val := NEW.id;
  END IF;

  -- Insere audit_log (agora garantido que company_uuid NUNCA acessa coluna errada)
  INSERT INTO public.audit_logs (
    company_id, user_id, action, entity, entity_id, old_data, new_data,
    ip_address, user_agent, created_at
  ) VALUES (
    company_uuid,
    auth.uid(),
    action_text,
    TG_ARGV[0],
    entity_id_val,
    old_data,
    new_data,
    inet_client_addr()::TEXT,
    current_setting('application_name', true),
    now()
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
--  FIM DO PATCH - audit_trigger_func CORRIGIDA!
-- ============================================================================
--  Agora execute este patch ANTES de rodar o SCRIPT_COMPLETO novamente.
--  Ou se preferir, as 5 PARTES SEPARADAS (01 a 05) estao na pasta /database/.
-- ============================================================================
