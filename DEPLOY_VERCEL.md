# ============================================================
#   🚀 DEPLOY NA VERCEL — PASSO A PASSO
#   Projeto: AgendPro SaaS (clinicasprojeto)
# ============================================================

# ============================================================
#  🔴 ANTES DE TUDO: Tenha certeza!
# ============================================================
#  1. O SQL do Supabase já foi rodado? Se NÃO:
#     - Rode PARTE_01 → PARTE_05 (em /database/)
#       ou se preferir o arquivo único: SCRIPT_COMPLETO_SUPABASE.sql
#     - Supabase → Authentication → Providers → Email →
#       DESMARQUE "Confirm email" (não precisa confirmar email)
#
#  2. O código foi enviado para o GitHub? Se NÃO rode:
#       git add .
#       git commit -m "preparando deploy vercel"
#       git push origin main
# ============================================================

# ============================================================
#  1️⃣ — CRIAR PROJETO NA VERCEL (3 cliques)
# ============================================================
#  1. Acesse: https://vercel.com/new
#  2. Escolha "GitHub" → encontre o repo: maycon341753/clinicasprojeto
#  3. Clique em "Import"
#  4. Na tela de configuração, NÃO MEXA em nada por enquanto —
#     apenas role a página até "Environment Variables" e vá para passo 2.

# ============================================================
#  2️⃣ — CONFIGURAR VARIÁVEIS DE AMBIENTE (OBRIGATÓRIO!)
# ============================================================
#  Na tela do projeto importado:
#  → Project Settings → Environment Variables
#  → OU na tela "Configure Project" antes de clicar em Deploy
#
#  Copie e cole EXATAMENTE estas variáveis abaixo, preenchendo
#  com os valores REAIS do seu projeto:
#
#  ┌──────────────────────────────┬────────────────────────────────────────┬────────────────────┐
#  │ NAME                         │ VALUE                                  │ ENVIRONMENTS       │
#  ├──────────────────────────────┼────────────────────────────────────────┼────────────────────┤
#  │ SUPABASE_URL                 │ https://ixwdnrvgtdcdljqtgfzb.supabase.co │ Production + Preview + Dev │
#  │ SUPABASE_ANON_KEY            │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (mesmo do .env) │ P+Pv+D │
#  │ SUPABASE_SERVICE_ROLE_KEY    │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role SECRETO) │ P+Pv+D │
#  │ NEXT_PUBLIC_APP_URL          │ https://SEU-PROJETO.vercel.app (colocar DEPOIS que a Vercel gerar a URL no primeiro deploy, ou preencha antes e atualize depois) │ P+Pv+D │
#  │ NEXT_TELEMETRY_DISABLED      │ 1                                      │ P+Pv+D │
#  └──────────────────────────────┴────────────────────────────────────────┴────────────────────┘
#
#  Onde pegar SUPABASE_*:
#    → https://supabase.com/dashboard/project/ixwdnrvgtdcdljqtgfzb/settings/api
#      SUPABASE_URL            = Project URL
#      SUPABASE_ANON_KEY       = anon public (Project API keys)
#      SUPABASE_SERVICE_ROLE_KEY = service_role (Project API keys → clique em "Reveal secret")
#
#  Atenção: NEXT_PUBLIC_APP_URL — se ainda não sabe a URL, coloque
#  http://localhost:8080 como fallback. Depois que fizer o primeiro
#  deploy e a Vercel der uma URL tipo https://clinicasprojeto-xxxx.vercel.app,
#  ATUALIZE a variável na Vercel e clique em "Redeploy".

# ============================================================
#  3️⃣ — CONFIGURAÇÕES DEPLOY (deixar como está — já tudo certo!)
# ============================================================
#  Framework Preset : Next.js  (detectado automaticamente)
#  Root Directory    : ./ (raiz do projeto)
#  Build Command     : next build     (já configurado em vercel.json)
#  Install Command   : npm install    (automático)
#  Output Directory  : .next          (automático — Next.js)
#  Regions           : sao1           (São Paulo, Brasil — mais rápido!)
#
#  Todos os valores acima são AUTOMATICOS graças aos arquivos:
#    - vercel.json (configurações Vercel)
#    - next.config.js (configurações Next.js)
#    - package.json (scripts build)
#
#  Clique em Deploy → aguarde 1-3 minutos.

# ============================================================
#  4️⃣ — PRIMEIRO DEPLOY FEITO? Siga estes passos:
# ============================================================
#  1. A Vercel gerou uma URL tipo:  https://clinicasprojeto-xxxx.vercel.app
#
#  2. Atualize NEXT_PUBLIC_APP_URL para a URL real (importante!)
#     Vercel → Settings → Environment Variables → NEXT_PUBLIC_APP_URL
#     Altere o valor para a URL gerada (ex: https://clinicasprojeto.vercel.app)
#     Depois vá para "Deployments" → clique nos 3 pontos do Último deploy
#     → "Redeploy" (sem cache!) — 1 minuto.
#
#  3. Adicione esta URL também no Supabase (para CORS e Redirect):
#     Supabase Dashboard → Authentication → URL Configuration
#       Site URL      : https://clinicasprojeto.vercel.app
#       Redirect URLs : adicione 2 URLs:
#         - https://clinicasprojeto.vercel.app/**
#         - https://clinicasprojeto.vercel.app/auth/callback
#
#  4. (Opcional) Adicionar domínio próprio:
#     Vercel → Settings → Domains → Add: agendpro.com.br
#     Siga as instruções de DNS (ponteiros A/TXT/CNAME)
#     Certificado SSL é automático (Let's Encrypt)

# ============================================================
#  5️⃣ — TESTAR DEPLOY (Checklist rápido 2 minutos)
# ============================================================
#  ✅ 1. Acesse a URL → Landing Page abre sem erros (console F12)
#  ✅ 2. Clique em "Começar Agora" → abre /cadastro
#  ✅ 3. Crie uma conta com email/senha (sem precisar confirmar!)
#  ✅ 4. Vai para /setup → onboarding de 6 passos
#  ✅ 5. Finaliza setup → abre /dashboard com KPIs
#  ✅ 6. Tenta agendar em /agendar/studio-bella → tela pública funciona
#  ✅ 7. /login funciona com a mesma conta
#  ✅ 8. Em F12 → Network → verifica que requests para Supabase
#          (ixwdnrvgtdcdljqtgfzb.supabase.co) voltam 200

# ============================================================
#  6️⃣ — DEU ERRO NO BUILD? Os mais comuns:
# ============================================================
#  ❌ "Build optimization failed: couldn't find ... SUPABASE_URL"
#     → Você esqueceu de configurar as Environment Variables na Vercel
#       (passo 2). Adicione e clique em Redeploy.
#
#  ❌ "relation public.profiles does not exist" / "schema"
#     → Você NÃO RODOU O SQL no Supabase. Volte para o passo
#       ANTES DE TUDO e execute o SCRIPT_COMPLETO_SUPABASE.sql
#       no SQL Editor.
#
#  ❌ "supabaseUrl is required" no console do navegador
#     → SUPABASE_URL ou SUPABASE_ANON_KEY estão vazios na Vercel
#       OU com espaço extra no começo/fim. Copie exato sem \n sem espaço.
#
#  ❌ "Invalid API key" / 401 ao tentar login
#     → Confirme que ANON_KEY (NÃO service_role!) está na variável
#       SUPABASE_ANON_KEY. Service role só vai em SUPABASE_SERVICE_ROLE_KEY.
#
#  ❌ A página /agendar/studio-bella mostra 404 na Vercel mas funciona local
#     → Voltar ao terminal local e rodar GIT PUSH (git status →
#       database/PARTE_05_SEED_DADOS.sql deve ter sido commitado
#       com o seed Studio Bella (slug studio-bella)). Se esqueceu
#       de rodar o seed no Supabase, execute o seed de novo.

# ============================================================
#  7️⃣ — ATUALIZAÇÕES FUTURAS: Como fazer deploy do novo código?
# ============================================================
#  Simples! Todo push para a branch "main" no GitHub automaticamente
#  dispara um novo deploy na Vercel (CI/CD automático).
#
#  Comandos:
#    git add .
#    git commit -m "adicionei x funcionalidade"
#    git push origin main
#
#  → Vercel detecta → builda → deploya → retorna ✅ pronto.
#  Rollback? Vercel → Deployments → 3 pontos → "Promote to Production"

# ============================================================
#  8️⃣ — (OPCIONAL) STORAGE SUPABASE PARA IMAGENS
# ============================================================
#  Para enviar logos, fotos dos profissionais, imagens serviços:
#  Supabase → Storage → New Bucket → Crie 3 buckets PUBLICOS:
#    - company-logos  (public)
#    - service-images (public)
#    - professional-photos (public)
#  Depois rode Policies de storage (opcional, pode ativar depois).

# ============================================================
#  FIM! Deploy realizado com sucesso? Parabéns! 🎉🎉🎉
#  AgendPro SaaS rodando na nuvem! 🚀
# ============================================================
