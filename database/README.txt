========================================
  INSTRUÇÕES DE MIGRAÇÃO - SUPABASE
========================================

1. PREPARANDO O SUPABASE
------------------------

1.1) Crie uma conta e projeto em https://supabase.com
1.2) Acesse o painel do projeto criado
1.3) Copie as credenciais:
     - Project URL (Settings > API > Project URL)
     - anon public key (Settings > API > anon public)
     - service_role key (Settings > API > service_role)

1.4) No arquivo .env (copie de .env.example), preencha:
     NEXT_PUBLIC_SUPABASE_URL=sua_project_url_aqui
     NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
     SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui


2. APLICANDO AS MIGRAÇÕES
-------------------------

2.1) No painel Supabase, acesse:
     SQL Editor > New query

2.2) Execute as migrações NA ORDEM abaixo (001 a 010):

     database/migrations/001_initial_schema.sql
     database/migrations/002_companies_table.sql
     database/migrations/003_users_profiles.sql
     database/migrations/004_services.sql
     database/migrations/005_professionals.sql
     database/migrations/006_clients.sql
     database/migrations/007_appointments.sql
     database/migrations/008_sales.sql
     database/migrations/009_holidays_blocks.sql
     database/migrations/010_notifications.sql

  DICA: Clique em "Run" para cada arquivo individualmente.
        Não altere a ordem, pois há dependências entre as tabelas.

2.3) Após executar todas as migrações, aplique o SEED:
     database/seeds/seed.sql

  OBS: O seed irá popular dados iniciais (horários padrão, status, tipos de negócio, etc.)
       e um usuário admin de teste.


3. HABILITANDO RLS (ROW LEVEL SECURITY)
---------------------------------------

3.1) Para cada tabela criada, é ESSENCIAL habilitar o RLS:

     No painel: Table Editor > Clique na tabela > ... (3 pontinhos) >
     Enable RLS > Enable RLS for table

     OU rode o comando SQL:
     ALTER TABLE nome_da_tabela ENABLE ROW LEVEL SECURITY;

3.2) As políticas (policies) já estão incluídas nos arquivos de migração (001 a 010).
     Se não aplicou, execute:
     database/migrations/011_rls_policies.sql


4. ARMAZENAMENTO (STORAGE)
--------------------------

4.1) Crie os buckets no Supabase Storage:

     - "avatars"    (para fotos de clientes/profissionais)
     - "services"   (para imagens dos serviços)
     - "documents"  (para relatórios e documentos)
     - "company"    (para logos e dados da empresa)

4.2) Configure as políticas de acesso no Storage:
     - avatars:    público de leitura, upload autenticado
     - services:   público de leitura, upload autenticado
     - documents:  privado, apenas usuário autenticado dono
     - company:    público de leitura, upload apenas admin


5. AUTENTICAÇÃO (Auth)
----------------------

5.1) No painel Supabase: Authentication > Providers > Email
     - Habilite Email provider
     - Desative "Confirm email" (opcional, para desenvolvimento)

5.2) Authentication > URL Configuration
     - Site URL: http://localhost:3000 (desenvolvimento)
     - Redirect URLs: adicione http://localhost:3000/auth/callback

5.3) Para produção, adicione o domínio real.


6. TESTANDO A CONEXÃO
---------------------

6.1) Inicie o projeto:
     npm install
     npm run dev

6.2) Acesse http://localhost:3000
     Deve aparecer a página inicial sem erros de conexão.

6.3) Login admin (se usou seed.sql):
     Email:    admin@clinica.com
     Senha:    admin123


7. PROBLEMAS COMUNS
-------------------

- "Auth session missing": Verifique se as credenciais no .env estão corretas.
- "Permission denied":   RLS não foi habilitado na tabela, rode ALTER TABLE ... ENABLE RLS.
- "Table not found":     Ordem das migrations errada, recomece do 001.
- "Seed não roda":       Execute as migrations 001-010 ANTES do seed.sql.


8. PRÓXIMOS PASSOS
------------------

- Configure Email/WhatsApp/Stripe/MercadoPago em integrations/
- Ajuste os serviços em services/ para usar o Supabase real (substitua os Promise.resolve mocks)
- Personalize businessTypes, services iniciais no seed.sql

========================================
  FIM - BOA SORTE!
========================================
