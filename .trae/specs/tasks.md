# AgendPro SaaS - Implementation Plan

---

## Fase 1: Setup Inicial do Projeto

## Task 1: Inicializar Next.js + React + Tailwind + Supabase
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Inicializar projeto Next.js (Pages Router, JavaScript) em `c:\xampp\htdocs\anasilvaclinica`
  - Instalar e configurar Tailwind CSS
  - Instalar dependências: @supabase/supabase-js, lucide-react, recharts, react-hook-form, zod, date-fns
  - Criar estrutura de pastas: /components, /pages, /layouts, /hooks, /services, /lib, /utils, /types, /api, /database, /contexts
  - Configurar porta 8080 para dev server
  - Criar arquivo `.env.example` com SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
  - Criar next.config.js preparado para Vercel
  - Criar vercel.json
  - Inicializar Git (.gitignore com node_modules, .env, .next)
- **Acceptance Criteria Addressed**: AC-1, AC-21, AC-22
- **Test Requirements**:
  - `rule` TR-1.1: Executar `npm run dev` na porta 8080 sem erros no console
  - `rule` TR-1.2: Executar `npm run build` sem erros
  - `rule` TR-1.3: Arquivo `.env.example` existe com 3 variáveis
  - `rule` TR-1.4: Todas as 9 pastas (components, pages, etc) existem
- **Notes**: Usar npx create-next-app@latest --js --tailwind --eslint --app false

---

## Fase 2: Banco de Dados Supabase (Tabelas + RLS + Policies)

## Task 2: Criar migrations SQL do banco de dados
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Criar diretório `/database/migrations`
  - Migration 001: `auth.uid()` helper, enable pgcrypto, extensions
  - Migration 002: Tabelas `profiles`, `roles`, `permissions`, `role_permissions`
  - Migration 003: Tabelas `plans`, `companies`, `subscriptions`, `company_users`, `company_roles`
  - Migration 004: Tabelas `service_categories`, `services`, `professionals`, `professional_services`, `clients`
  - Migration 005: Tabelas `business_hours`, `professional_hours`, `holidays`, `schedule_blocks`
  - Migration 006: Tabelas `appointments`, `appointment_status_history`
  - Migration 007: Tabelas `sales`, `sale_items`, `payments`, `commissions`
  - Migration 008: Tabelas `notifications`, `settings`, `audit_logs`
  - Todas tabelas com UUID PK, FK, indexes, timestamps (created_at, updated_at), soft delete (deleted_at)
  - Campos obrigatórios em `companies`: id, name, trade_name, document, email, phone, whatsapp, address, city, state, zip_code, logo_url, primary_color, secondary_color, slug UNIQUE, business_type, status, timestamps
  - Todas tabelas de negócio com `company_id` FK para companies
- **Acceptance Criteria Addressed**: AC-4, FR-DB, FR-MT-1/2
- **Test Requirements**:
  - `rule` TR-2.1: Todas as 20+ tabelas existem no SQL
  - `rule` TR-2.2: Todas tabelas exceto roles/permissions/plans tem `company_id`
  - `rule` TR-2.3: Tabelas tem created_at, updated_at, deleted_at
  - `rule` TR-2.4: `companies.slug` é UNIQUE
- **Notes**: Salvar SQL em `/database/migrations/NNN_nome.sql`

## Task 3: Criar RLS Policies e triggers
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - Migration 009: Enable RLS em todas tabelas
  - Policies para profiles: usuário vê seu próprio profile, super_admin vê todos
  - Policies para companies: só usuário com vínculo em company_users vê company
  - Policies para demais tabelas: só acessa se company_id for da empresa do usuário logado
  - Policies para clientes: clientes autenticados só veem seus próprios agendamentos
  - Policy para área pública: agendamento público lê serviços/profissionais/horários sem login (anon key)
  - Trigger `set_updated_at` automático para todas tabelas
  - Trigger de auditoria para INSERT/UPDATE/DELETE que grava em `audit_logs`
  - Função auxiliar `get_user_company_id()`
- **Acceptance Criteria Addressed**: AC-4, AC-13, FR-SEC-2, FR-AUD
- **Test Requirements**:
  - `rule` TR-3.1: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` presente para todas tabelas
  - `rule` TR-3.2: Policy SELECT/INSERT/UPDATE/DELETE por company_id para tabelas de negócio
  - `rule` TR-3.3: Trigger audit_logs definido
  - `rule` TR-3.4: Função get_user_company_id definida
- **Notes**: Criar arquivo de políticas separado 009_rls_policies.sql

## Task 4: Criar seed de demonstração (Studio Bella)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 3
- **Description**:
  - Migration 010_seed.sql:
    - Inserir roles: super_admin, admin_empresa, gerente, recepcionista, profissional, cliente
    - Permissões padrão
    - Plano Gratuito, Básico, Profissional, Enterprise
    - Empresa "Studio Bella" (slug: studio-bella, business_type: salao_beleza)
    - Usuário admin: admin@studiobella.com.br
    - Serviços: Corte (R$80, 60min), Escova (R$60, 45min), Manicure (R$50, 60min), Pedicure (R$60, 75min), Design de sobrancelha (R$45, 30min)
    - Categorias: Cabelo, Unhas, Estética
    - Profissionais: Ana (Cabelo, comissão 30%), Juliana (Unhas, 30%), Carlos (Cabelo, 25%)
    - Professional_services vínculos
    - Clientes: Maria Silva (11999999999), João Santos, Ana Costa
    - Horários de funcionamento padrão (seg-sex 08-18, sab 08-12, dom fechado)
    - Horários profissionais
    - 5 agendamentos de demonstração com status variados
    - 3 vendas concluídas
- **Acceptance Criteria Addressed**: AC-20, FR-SEED
- **Test Requirements**:
  - `rule` TR-4.1: Empresa Studio Bella (slug studio-bella) inserida
  - `rule` TR-4.2: 5 serviços + 3 categorias inseridos
  - `rule` TR-4.3: 3 profissionais inseridos
  - `rule` TR-4.4: 5+ agendamentos demo inseridos
- **Notes**: Incluir instructions.txt de como aplicar as migrations

---

## Fase 3: Landing Page Pública

## Task 5: Implementar Landing Page completa
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Página `/` (pages/index.js)
  - Hero: Título "Seu negócio organizado. Seus clientes agendados. Seu atendimento mais profissional." + 2 CTAs (Começar grátis -> /cadastro, Testar plataforma -> /agendar/studio-bella) + Botão Entrar -> /login
  - Seção Benefícios (6 cards com ícones Lucide)
  - Seção Como Funciona (3 passos: Cadastre, Organize, Agende)
  - Seção Recursos (grid 8 recursos)
  - Seção Para quem é (Clínica, Salão, Barbearia, Restaurante, etc.)
  - Seção Demonstração (mockup agenda + dashboard)
  - Seção Planos (4 planos: Gratuito R$0, Básico R$79, Profissional R$149, Enterprise sob consulta)
  - Seção FAQ (accordion 8 perguntas)
  - Seção CTA final
  - Rodapé com links, redes sociais, copyright
  - Totalmente responsivo (mobile, tablet, desktop)
  - Paleta profissional (azul/verde ou roxo/azul)
- **Acceptance Criteria Addressed**: AC-2, FR-LP
- **Test Requirements**:
  - `rule` TR-5.1: 10 seções (Hero, Beneficios, Como, Recursos, Quem, Demo, Planos, FAQ, CTA, Rodape) renderizadas
  - `rubric` TR-5.2: Qualidade visual; scale 1-5; 1=crudo 3=medio 5=profissional moderno; threshold >=4; evidence screenshot
  - `rule` TR-5.3: 3 botões CTA com links corretos
  - `rule` TR-5.4: Responsivo em 375px sem overflow horizontal
- **Notes**: Criar componentes em /components/landing/

---

## Fase 4: Autenticação e Rotas Protegidas

## Task 6: Integrar Supabase Auth + páginas de auth
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**:
  - Criar /lib/supabaseClient.js (frontend, anon key)
  - Criar /lib/supabaseServer.js (backend API routes, service role)
  - Criar /contexts/AuthContext.js (prove usuário atual, perfil, empresa atual)
  - Criar /hooks/useAuth.js
  - Página /login (pages/login.js): formulário email/senha, link recuperar senha, link cadastro
  - Página /cadastro (pages/cadastro.js): cadastra usuário + cria empresa inicial (setup wizard inicial)
  - Página /recuperar-senha (pages/recuperar-senha.js): envia email reset
  - Página /alterar-senha (pages/alterar-senha.js): definida via token do email
  - Página /confirmar-email (auto-redirect via Supabase)
  - Página /perfil (pages/perfil.js): editar dados, foto, senha
  - Criar /middleware.js que protege rotas /dashboard, /agenda, etc (redireciona /login se ausente)
  - Criar pages/api/auth/callback.js e páginas necessárias
  - Toast notifications de sucesso/erro
- **Acceptance Criteria Addressed**: AC-3, FR-AUTH
- **Test Requirements**:
  - `rule` TR-6.1: Supabase client inicializado (sem chaves reais, .env)
  - `rule` TR-6.2: 5 páginas de auth criadas
  - `rule` TR-6.3: AuthContext disponibiliza user + profile
  - `rule` TR-6.4: Middleware bloqueia /dashboard sem sessão
- **Notes**: React Hook Form + Zod para validações de formulário

## Task 7: RBAC - Controle de permissões
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 6
- **Description**:
  - Tabela roles + permissions carregadas no perfil do usuário
  - Hook /hooks/usePermissions.js: can('criar_agendamento'), hasRole('admin_empresa')
  - Componente <Can action="..." resource="...">...</Can> (renderiza só se permitido)
  - Componente <RoleGuard roles={['admin_empresa','gerente']}>...</RoleGuard>
  - Sidebar só mostra itens permitidos por papel
  - Proteção em API routes: verifica papel antes de executar operação
  - Super Admin papel separado (acessa /super-admin)
- **Acceptance Criteria Addressed**: FR-AUTH-8/9, AC-14
- **Test Requirements**:
  - `rule` TR-7.1: Hook usePermissions existe com can() e hasRole()
  - `rule` TR-7.2: Componentes <Can> e <RoleGuard> criados
  - `rule` TR-7.3: Middleware/guards bloqueiam acesso proibido
- **Notes**: Definir matriz de permissões em /lib/permissions.js

---

## Fase 5: Layout Administrativo

## Task 8: Layout Admin (Sidebar + Header + Topbar)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 6, Task 7
- **Description**:
  - /layouts/AdminLayout.js: Sidebar esquerda + Header topo + Content area
  - Sidebar clara e profissional (colapsável em desktop, drawer em mobile)
  - Itens do menu (com ícones Lucide): Dashboard, Agenda, Agendamentos, Clientes, Serviços, Profissionais, Vendas, Financeiro, Comissões, Relatórios, Notificações, Configurações
  - Footer opcional no layout
  - Header Topbar:
    - Input busca global (pesquisa cliente, agendamento, serviço, profissional)
    - Ícone sino notificações com badge
    - Dropdown perfil (Perfil, Configurações, Sair)
    - Dropdown empresa atual (se usuário tem >1 empresa)
    - Menu hambúrguer no mobile abre sidebar drawer
  - Criar UI components reutilizáveis em /components/ui/: Card, Button, Input, Badge, Avatar, Table, Tabs, Modal, Dropdown, Toast, Skeleton, EmptyState, DialogConfirm, Select
  - Criar toaster global com sistema de notifications
- **Acceptance Criteria Addressed**: FR-MENU, FR-UX, FR-SG, AC-17
- **Test Requirements**:
  - `rule` TR-8.1: AdminLayout renderiza Sidebar + Topbar + Content
  - `rule` TR-8.2: 12+ componentes UI criados em /components/ui
  - `rule` TR-8.3: Input busca global presente no topbar
  - `rule` TR-8.4: Mobile menu hambúrguer funcional
- **Notes**: Inspirar em shadcn/ui mas em Tailwind puro

---

## Fase 6: Cadastro da Empresa + Configurações

## Task 9: Setup inicial da empresa (onboarding wizard)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 8
- **Description**:
  - Após primeiro login/cadastro, se empresa não configurada, exibir wizard em /setup
  - Passo 1: Dados empresa (nome, fantasia, CNPJ, email, fone, whatsapp)
  - Passo 2: Endereço (rua, cidade, estado, cep)
  - Passo 3: Tipo negócio (seleção dropdown)
  - Passo 4: Logo upload + cores primária/secundária
  - Passo 5: Slug gerado automaticamente (editável)
  - Passo 6: Horários de funcionamento padrão
  - Grava tudo em companies e company_users
  - Ao final redireciona para /dashboard
- **Acceptance Criteria Addressed**: FR-CE
- **Test Requirements**:
  - `rule` TR-9.1: 6 passos do wizard existem
  - `rule` TR-9.2: Formulários validam campos obrigatórios
  - `rule` TR-9.3: Grava companies.company.id e retorna para /dashboard
- **Notes**: Se existir empresa skip onboarding (checar no AuthContext)

## Task 10: Página Configurações com abas
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 8
- **Description**:
  - /pages/configuracoes/index.js com Tabs
  - Aba Empresa: edição dados da empresa (mesmos campos do cadastro)
  - Aba Agenda: horários de funcionamento semanais, intervalo
  - Aba Agendamento: antecedência mínima (ex 30min), antecedência máxima (ex 30 dias), permitir cancelamento bool, tempo min cancelamento, intervalo entre horários (15/30min)
  - Aba Pagamentos: formas de pagamento disponíveis (checkbox: dinheiro, pix, debito, credito, outros)
  - Aba Usuários: lista usuários da empresa, cadastrar novo, editar papel (admin/gerente/recepcionista/profissional), desativar
  - Aba Permissões: visualização matriz de permissões por papel
  - Aba Aparência: logo, cores, tema claro/escuro
  - Tabela `settings` JSON para key/value customizadas
- **Acceptance Criteria Addressed**: FR-CFG, FR-HF
- **Test Requirements**:
  - `rule` TR-10.1: 7 abas funcionam
  - `rule` TR-10.2: Horários de funcionamento gravam em business_hours
  - `rule` TR-10.3: CRUD usuários da empresa funciona
- **Notes**: Usar componente <Tabs> reutilizável

---

## Fase 7: CRUDs Básicos

## Task 11: CRUD Serviços + Categorias
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 8
- **Description**:
  - /pages/servicos/index.js: lista serviços (tabela: nome, categoria, duração, preço, status, ações editar/inativar)
  - Botão Novo Serviço abre modal ou página /servicos/novo
  - Form: nome, descrição, categoria (select + criar nova), preço, duração minutos, imagem upload, status (ativo/inativo)
  - Página /servicos/[id].js: editar
  - API Routes:
    - GET /api/services: lista com filtros
    - POST /api/services: criar
    - PUT /api/services/:id: atualizar
    - DELETE /api/services/:id: soft delete
  - /pages/servicos/categorias.js: CRUD categorias
- **Acceptance Criteria Addressed**: AC-5, FR-SVC
- **Test Requirements**:
  - `rule` TR-11.1: CRUD 4 operações em serviço
  - `rule` TR-11.2: CRUD categorias
  - `rule` TR-11.3: Soft delete funciona
  - `rule` TR-11.4: Respeita company_id
- **Notes**: Validação preço >0, duração >0

## Task 12: CRUD Profissionais
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 11, Task 8
- **Description**:
  - /pages/profissionais/index.js: lista tabela (foto, nome, especialidade, telefone, comissão %, status, ações)
  - Páginas: /profissionais/novo e /profissionais/[id].js
  - Form dados: nome, foto upload, especialidade, telefone, email, tipo comissão (percentual/fixo), valor comissão, status
  - Sub-aba Serviços: checkboxes seleciona serviços que profissional executa (grava professional_services)
  - Sub-aba Horários: horário profissional próprio (usa professional_hours)
  - Sub-aba Bloqueios: folgas/férias/bloqueios pessoais
  - API Routes completas
- **Acceptance Criteria Addressed**: AC-6, FR-PROF, FR-DP
- **Test Requirements**:
  - `rule` TR-12.1: CRUD 4 operações profissional
  - `rule` TR-12.2: Vinculação professional_services salva múltiplos serviços
  - `rule` TR-12.3: Horários profissional gravam
- **Notes**: Mesmo pattern do CRUD serviços

## Task 13: CRUD Clientes + CRM detalhado
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 8
- **Description**:
  - /pages/clientes/index.js: lista com busca (nome/telefone/email), tabela com: nome, telefone, email, ultimo atendimento, total gasto, qtd atendimentos, ticket médio, status
  - /pages/clientes/novo.js: cadastro (nome, CPF, telefone, WhatsApp, email, dt nasc, endereço, observações)
  - /pages/clientes/[id].js: Página detalhada com Tabs:
    - Informações (ver/editar dados pessoais)
    - Histórico (agendamentos, serviços, cancelamentos, pagamentos - tabela com datas)
    - Indicadores (cards: total gasto, ticket médio, qtd atendimentos, última visita, primeiro atendimento)
  - API Routes clientes
- **Acceptance Criteria Addressed**: AC-7, FR-CRM
- **Test Requirements**:
  - `rule` TR-13.1: Lista clientes com busca por nome/telefone/email
  - `rule` TR-13.2: Página detalhe abre e mostra 3 abas
  - `rule` TR-13.3: Indicadores calculam SQL real (não mock)
- **Notes**: Ticket médio = total_gasto / qtd_atendimentos

---

## Fase 8: Horários, Feriados, Bloqueios

## Task 14: Módulo Feriados e Bloqueios de Agenda
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 8, Task 10
- **Description**:
  - Página /configuracoes/bloqueios ou submenu Agenda > Bloqueios
  - Calendário visual + lista
  - Novo Bloqueio modal:
    - Tipo: dia inteiro / horário específico / período
    - Data(s): data única ou início-fim
    - Horário (se não dia inteiro)
    - Motivo (select: feriado, reunião, manutenção, folga, férias, outro) + descrição
    - Opcionalmente: profissional específico (bloqueio individual)
  - Salva em `schedule_blocks` e `holidays`
  - Integra com disponibilidade (já aplicando regras)
- **Acceptance Criteria Addressed**: FR-FB
- **Test Requirements**:
  - `rule` TR-14.1: CRUD bloqueios com 3 tipos
  - `rule` TR-14.2: Bloqueio por profissional e global
  - `rule` TR-14.3: Integra validacao disponibilidade
- **Notes**: Services em /lib/availability.js helpers

## Task 15: Helper de Disponibilidade (coração da validação)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 10, Task 11, Task 12, Task 14
- **Description**:
  - Criar `/services/availabilityService.js` e `/lib/availability.js`
  - Função `getAvailableSlots(companyId, professionalId?, serviceId, date, intervalMinutes=30)`:
    - 1. Carrega business_hours da empresa e professional_hours (se profissional)
    - 2. Carrega holidays e schedule_blocks
    - 3. Gera todos slots possíveis (ex: 08:00, 08:30...) respeitando intervalos
    - 4. Remove slots fora de horário funcionamento/intervalo almoço
    - 5. Remove slots conflitantes com appointments existentes (considerando duration do serviço):
      - Se serviço 60min, pega slot e verifica conflito [slot..slot+duration] vs existentes
    - 6. Retorna array horários disponíveis ["09:00","09:30",...]
  - Função `checkConflict(companyId, professionalId, date, startTime, durationMinutes, excludeAppointmentId?)`
  - Exporta como parte de API Route GET /api/availability
- **Acceptance Criteria Addressed**: FR-REGRAS, FR-AM-2/3, FR-APC-5
- **Test Requirements**:
  - `rule` TR-15.1: getAvailableSlots ignora horários fechados
  - `rule` TR-15.2: Conflito horário existente remove slots corretamente
  - `rule` TR-15.3: Bloqueios/feriados removem slots
- **Notes**: Este é o coração do sistema; cobrir com validações detalhadas

---

## Fase 9: Agenda e Agendamentos

## Task 16: Agenda com visualizações Dia/Semana/Mês
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 8, Task 15
- **Description**:
  - /pages/agenda/index.js
  - Tabs topo: Dia / Semana / Mês
  - Botões anterior/próximo e Hoje
  - Filtros: profissional (todos ou específico), status
  - Visualização Dia:
    - Timeline vertical horas 08:00 às 20:00
    - Cards coloridos de agendamentos no horário correto (altura proporcional à duração)
    - Cores por status:
      - pending = amarelo, confirmed = azul, in_progress = roxo, completed = verde, cancelled = cinza, no_show = vermelho
    - Hover tooltip com detalhes
  - Visualização Semana: 7 colunas (seg-dom) com timelines
  - Visualização Mês: grid calendário, cada dia mostra contador de agendamentos + top 3
  - Clique em horário vazio: abre modal de novo agendamento
  - Clique no agendamento: modal de detalhes com ações (editar, cancelar, confirmar, marcar em atendimento, concluir, marcar não compareceu, reagendar)
  - Cada ação grava em appointment_status_history
- **Acceptance Criteria Addressed**: AC-8, FR-AG, FR-STATUS
- **Test Requirements**:
  - `rule` TR-16.1: 3 visualizações (Dia/Semana/Mês) carregam dados
  - `rule` TR-16.2: 6 status aparecem com cores diferentes
  - `rule` TR-16.3: Ações status mudam appointment e gravam history
  - `rubric` TR-16.4: Usabilidade e layout agenda; scale 1-5; threshold >=4; evidence screenshot
- **Notes**: Estrutura preparada para drag-and-drop (atributos data-appointment-id e onDrag)

## Task 17: Agendamento Manual (CRUD agendamentos)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 13, Task 15
- **Description**:
  - /pages/agendamentos/index.js: lista agendamentos com filtros (data inicio/fim, profissional, cliente, status, serviço)
  - /pages/agendamentos/novo.js ou modal: Form agendamento:
    - Passo 1: Seleciona Cliente (select busca ou botão novo cliente rápido)
    - Passo 2: Seleciona Serviço
    - Passo 3: Seleciona Profissional (opção "qualquer" - sistema escolhe o 1º disponível) + carrega serviços do profissional
    - Passo 4: Data (datepicker)
    - Passo 5: Horário (radio buttons com horários DISPONÍVEIS via availabilityService)
    - Observações, Valor (default service.price, editável), Forma pagamento, Status (default pending)
  - Validação: impede submissão se conflito
  - Página /agendamentos/[id].js: detalhar/editar
- **Acceptance Criteria Addressed**: FR-AM, FR-REGRAS-1 a 6
- **Test Requirements**:
  - `rule` TR-17.1: Submissão cria appointment com sucesso
  - `rule` TR-17.2: Tentar horário conflitante exibe erro e impede
  - `rule` TR-17.3: Opção "qualquer profissional" funciona
- **Notes**: API routes POST/GET/PUT/DELETE /api/appointments

---

## Fase 10: Área Pública de Agendamento

## Task 18: Fluxo público de agendamento /agendar/[slug]
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 5, Task 15, Task 17
- **Description**:
  - Página /pages/agendar/[slug].js (pega empresa por slug, 404 se não existir)
  - Header público: logo empresa, nome, cor primária personalizada
  - Progress bar de 6 etapas
  - Etapa 1 - Serviço:
    - Grid de cards com imagem, nome, descrição, duração, preço
    - Filtro por categoria
  - Etapa 2 - Profissional:
    - Cards avatar profissional: foto, nome, especialidade
    - 1º card "Qualquer profissional disponível"
    - Só mostra profissionais que executam serviço da etapa 1
  - Etapa 3 - Data: calendário mensal, somente dias úteis (validos por regras) clicáveis
  - Etapa 4 - Horário: Radio buttons horários disponíveis para data+profissional+serviço (getAvailableSlots)
  - Etapa 5 - Dados cliente:
    - Nome * , Telefone * , WhatsApp, E-mail *, Observação
    - NÃO pede senha. Verifica no banco por telefone/email: se existe client, reutiliza e associa; senão cria novo client
  - Etapa 6 - Resumo:
    - Serviço, profissional (ou "qualquer"), data formatada, horário, valor
    - Botão grande "Confirmar agendamento"
    - Confirma: cria appointment + client (se novo) + envia notification interna
    - Tela de sucesso: "Agendamento confirmado!" + nº agendamento + botão "Adicionar à agenda" (.ics file?) + botão "Agendar outro"
  - Tudo 100% responsivo, mobile-first
- **Acceptance Criteria Addressed**: AC-9, FR-APC, FR-ACL-6
- **Test Requirements**:
  - `rule` TR-18.1: Acessar /agendar/studio-bella carrega empresa correta
  - `rule` TR-18.2: 6 etapas navegação linear
  - `rule` TR-18.3: Confirmar cria appointment + client com sucesso
  - `rubric` TR-18.4: UX mobile similar a app moderno; scale 1-5; threshold >=4; evidence screenshot 375px
- **Notes**: Página NÃO requer login (acesso anônimo via anon key Supabase com policies de leitura para serviços/profissionais)

## Task 19: Portal público /empresa/[slug] e Área do Cliente logada
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 18, Task 6
- **Description**:
  - /pages/empresa/[slug].js: página pública da empresa (sobre, endereço, botão grande "Agendar agora" -> /agendar/[slug])
  - /pages/meus-agendamentos.js (área cliente logada, ou por token único):
    - Lista próximos agendamentos cards (com ações reagendar/cancelar)
    - Histórico tab
    - Serviços realizados tab + total gasto
    - Perfil tab (editar dados pessoais + definir senha)
    - Botão "Agendar novamente" em cada item histórico (preenche serviço+profissional automaticamente, redireciona etapa 3)
    - Card "Agendar novamente" em destaque com serviços mais usados
- **Acceptance Criteria Addressed**: FR-ACL, FR-MT-4
- **Test Requirements**:
  - `rule` TR-19.1: /empresa/[slug] carrega dados empresa
  - `rule` TR-19.2: Próximos agendamentos lista apontamentos futuros
  - `rule` TR-19.3: Cancelar muda status cancelled e loga history
- **Notes**: Após primeiro agendamento, cliente tem opção de definir senha e ter conta

---

## Fase 11: Dashboard Administrativo

## Task 20: Dashboard completo com indicadores + gráficos
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 8, Task 17
- **Description**:
  - /pages/dashboard/index.js
  - Filtro período topo: Hoje / Ontem / Últimos 7d / Últimos 30d / Este mês / Mês anterior / Personalizado (date range picker)
  - Linha 1 (10 cards):
    1. Faturamento Hoje
    2. Faturamento Mês
    3. Agendamentos Hoje
    4. Agendamentos Mês
    5. Serviços Realizados (período)
    6. Clientes Novos (período)
    7. Clientes Ativos
    8. Ticket Médio (período)
    9. Taxa de Cancelamento %
    10. Taxa de Ocupação % (horas ocupadas / disponíveis)
  - Linha 2 Gráficos Recharts:
    - Gráfico Faturamento (Linha/Barras) com toggle Dia/Semana/Mês
    - Gráfico Agendamentos Por Status (Pizza/Barras empilhadas): pending/confirmed/in_progress/completed/cancelled/no_show
  - Linha 3:
    - Ranking Serviços Mais Vendidos (tabela: serviço, qtd, faturamento, % participação)
    - Ranking Profissionais (tabela: nome, atendimentos, faturamento, ticket médio, % ocupação)
  - Linha 4:
    - Cards Clientes: Novos / Recorrentes / Inativos
    - Insights inteligentes (3-5 boxes) calculados dinamicamente:
      - "Seu faturamento aumentou 15% vs mês anterior" (quando true)
      - "Serviço mais vendido: Corte Masculino (24x)"
      - "Hoje você tem 12 horários disponíveis"
      - "Ticket médio: +8% vs semana passada"
      - "Quarta-feira tem maior ocupação (89%)"
  - Todas consultas SQL reais via API route /api/dashboard?start=&end=
- **Acceptance Criteria Addressed**: AC-10, FR-DA, FR-DI
- **Test Requirements**:
  - `rule` TR-20.1: 10 cards com valores calculados SQL
  - `rule` TR-20.2: 2 gráficos Recharts renderizam com dados reais
  - `rule` TR-20.3: 2 rankings + clientes card
  - `rule` TR-20.4: Insights dinâmicos aparecem (pelo menos 3)
  - `rubric` TR-20.5: Layout dashboard profissional; scale 1-5; threshold >=4
- **Notes**: Usar queries em /services/dashboardService.js com SQL agregado

## Task 21: Dashboard de Vendas + Financeiro
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 20
- **Description**:
  - /pages/vendas/index.js:
    - Cards: Faturamento Bruto, Descontos (R$), Faturamento Líquido, Qtd Vendas, Ticket Médio
    - Tabela lista vendas com filtros (data, cliente, profissional, status, forma pgto)
    - Ranking serviços + ranking profissionais + ranking clientes
    - Gráfico vendas por período (linha)
  - /pages/financeiro/index.js:
    - Indicadores (cards): Faturamento período, Recebimentos (paid), Valores pendentes (pending_payment), Descontos, Cancelamentos, Ticket Médio
    - Abas relatórios:
      - Faturamento por Dia (tabela)
      - Faturamento por Serviço
      - Faturamento por Profissional
      - Faturamento por Forma Pagamento
    - Gráfico de barras empilhado por forma de pagamento
  - Ao concluir appointment (completed), pergunta se deseja registrar pagamento e cria sale + payment + comissão automática
- **Acceptance Criteria Addressed**: FR-VEND, FR-FIN, FR-TM
- **Test Requirements**:
  - `rule` TR-21.1: 5 cards vendas calculam corretamente
  - `rule` TR-21.2: Ticket médio calcula e compara período anterior
  - `rule` TR-21.3: Concluir agendamento gera venda + pagamento
- **Notes**: Ticket médio = sum(valor_final)/count(vendas) no período

## Task 22: Módulo Comissões
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 21
- **Description**:
  - /pages/comissoes/index.js:
    - Cards: Comissão Gerada período, Comissão Paga, Comissão Pendente
    - Tabela comissão por profissional (período): Nome, Vendas (R$), Comissão %, Valor Comissão, Pago, Pendente
    - Tabela detalhada de comissões (cada venda com profissional, serviço, valor, comissão, status pgto)
    - Marcar como paga (muda status, grava payments.commission_payment)
  - Cálculo:
    - Se professional.tipo_comissao = percentual: sale.valor_final * (professional.comissao / 100)
    - Se fixo: professional.comissao_valor_fixo
  - Tabela `commissions` com: id, company_id, professional_id, sale_id, amount, status (pendente/paga), data pagamento
- **Acceptance Criteria Addressed**: FR-COM, AC-12
- **Test Requirements**:
  - `rule` TR-22.1: Comissão 30% de venda R$100 = R$30 calculado
  - `rule` TR-22.2: Comissão valor fixo calcula
  - `rule` TR-22.3: 3 cards gerada/paga/pendente exibem
- **Notes**: Trigger ao criar sale calcula e insere commissions automaticamente

---

## Fase 12: Relatórios + Export CSV

## Task 23: Módulo Relatórios + Export CSV
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 21, Task 22
- **Description**:
  - /pages/relatorios/index.js (ou abas)
  - Relatórios disponíveis (cards selecionáveis ou tabs):
    1. Relatório Agendamentos
    2. Relatório Faturamento
    3. Relatório Serviços
    4. Relatório Clientes
    5. Relatório Profissionais
    6. Relatório Cancelamentos
    7. Relatório Comissões
    8. Relatório Ticket Médio
    9. Relatório Taxa Ocupação
  - Cada um com:
    - Filtro data início/fim obrigatórios + filtros específicos
    - Botão "Gerar relatório"
    - Tabela com resultados
    - Cards resumo (se aplicável)
    - Gráfico (se aplicável)
    - Botão "Exportar CSV" (gera arquivo CSV UTF-8 com BOM para Excel)
  - Função genérica exportToCSV(data, filename) em /utils/csv.js
- **Acceptance Criteria Addressed**: FR-REL, AC-15
- **Test Requirements**:
  - `rule` TR-23.1: 9 relatórios selecionáveis
  - `rule` TR-23.2: Export CSV gera download com dados (checar content-disposition)
  - `rule` TR-23.3: Filtros período aplicam corretamente
- **Notes**: CSV separado por ; para compatibilidade Excel PT-BR

---

## Fase 13: Área do Cliente + Super Admin

## Task 24: Dashboard Ocupação + Super Admin
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 20
- **Description**:
  - Widget taxa ocupação em dashboard (já incluso em Task 20 card 10)
  - /pages/super-admin/index.js (apenas papel super_admin acessa):
    - Cards: Empresas Cadastradas, Ativas, Inativas, Usuários totais, Agendamentos totais, Faturamento Total Platforma (% sobre planos)
    - Tabs/Gerenciar:
      - Empresas (tabela com status, editar, ativar/inativar, ver detalhes)
      - Planos (CRUD planos com limites configuráveis: max_profissionais, max_clientes, max_servicos, features bools)
      - Assinaturas (listar, alterar plano, cancelar, renovar)
      - Usuários (todos usuários da plataforma)
      - Configurações Globais (chaves de pagamento, taxa de plataforma)
  - Guard no /middleware.js: só super_admin acessa /super-admin*
- **Acceptance Criteria Addressed**: FR-SA, FR-PLAN, AC-14, FR-44
- **Test Requirements**:
  - `rule` TR-24.1: /super-admin bloqueado para usuário comum
  - `rule` TR-24.2: 6 cards super admin
  - `rule` TR-24.3: CRUD planos
- **Notes**: Se não houver super_admin, bloquear tudo com 403

---

## Fase 14: Notificações, Auditoria, Busca Global, Estrutura integrações

## Task 25: Notificações + Auditoria + Busca Global + estrutura integrações
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 8, Task 17
- **Description**:
  - Busca Global (topbar input):
    - API Route GET /api/search?q=term
    - Procura em clients (nome/telefone/email), appointments (id/cliente/serviço), services (nome), professionals (nome/especialidade)
    - Resultados agrupados por tipo com links (ex: /clientes/123, /agendamentos/456)
  - Notificações (sino topbar):
    - Tabela `notifications` com: user_id, company_id, type (novo_agendamento, cancelado, etc), title, message, data (JSON), read_at
    - Criar no momento do evento (ex: ao criar appointment público, insere notificação para admin da empresa)
    - Lista dropdown no sino, marcar como lida, badge contagem não lidas
    - /services/notificationService.js com dispatchNotification()
  - Auditoria:
    - Já triggers SQL da Task 3 gravam audit_logs
    - (Opcional) Página super-admin logs
  - Estrutura integrações futuras:
    - /integrations/WhatsApp/ - index.js com classe stub (sendAppointmentConfirmation)
    - /integrations/Email/ - stub
    - /integrations/Payment/Stripe.js + MercadoPago.js stubs
    - /integrations/GoogleCalendar.js stub
- **Acceptance Criteria Addressed**: FR-NOTIF, FR-SG, FR-AUD, FR-INT, AC-18, AC-19
- **Test Requirements**:
  - `rule` TR-25.1: Busca retorna pelo menos um tipo de entidade
  - `rule` TR-25.2: Novo agendamento cria notificação lida
  - `rule` TR-25.3: Ao editar cliente, audit_logs recebe registro
  - `rule` TR-25.4: Pasta /integrations com stubs criada
- **Notes**: Não implementar APIs reais, só estrutura pronta

---

## Fase 15: Responsividade, Build, Correções Finais, Readme inicial

## Task 26: Responsividade final, correções, teste build
- **Status**: `pending`
- **Priority**: high
- **Depends On**: ALL (Tasks 1-25)
- **Description**:
  - Responsividade detalhada:
    - Mobile < 640px: sidebar drawer, dashboard cards empilhados 1 coluna, calendários mobile-friendly
    - Tablet 640-1024px: sidebar pode estar mini ou drawer
    - Desktop >=1024: sidebar completa
    - Área pública agendamento mobile: etapas tela cheia, botões grandes
  - Testar console: remover warnings, errors, unused imports
  - Testar build com `npm run build` e corrigir erros
  - Testar todas rotas principais e corrigir 404/quebradas
  - Ajustar mensagens de erro amigáveis em todos forms
  - Adicionar skeleton loading em páginas de listagem/detalhe
  - Adicionar Empty states (sem dados)
  - Adicionar ConfirmDialog em ações destrutivas (cancelar agendamento, excluir cliente etc)
  - Revisar RLS e permissões
- **Acceptance Criteria Addressed**: AC-16, AC-22, FR-UX, FR-RESP
- **Test Requirements**:
  - `rubric` TR-26.1: Responsividade geral; scale 1-5; threshold >=4; evidence screenshots multiplos tamanhos
  - `rule` TR-26.2: `npm run build` exit code 0
  - `rule` TR-26.3: Navegação entre 10 páginas principais sem erro console
  - `rule` TR-26.4: Forms mostram mensagem erro amigável (campo obrigatório, etc)
- **Notes**: Esta tarefa é de "polimento final" e é crítica

---

## Task 27: Documentação mínima (README inicial)
- **Status**: `pending`
- **Priority**: low
- **Depends On**: Task 26
- **Description**:
  - Criar README.md básico (apenas se não existir e for realmente necessário - seguir rules)
  - (Não criar documentação proativa excessiva)
  - Apenas /DATABASE.md com instruções de aplicar migrations + seed no Supabase
- **Acceptance Criteria Addressed**: Auxiliar setup
- **Test Requirements**:
  - `rule` TR-27.1: Instruções para aplicar 001 até 010 seed
- **Notes**: Documentação mínima, evite arquivos desnecessários
