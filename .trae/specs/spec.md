# AgendPro SaaS - Product Requirements Document

## Overview
- **Summary**: Plataforma SaaS completa, moderna, responsiva e profissional de agendamento e gestão de serviços voltada para clínicas, salões de beleza, barbearias, cabeleireiros, manicures, estética, odontologia, restaurantes, hamburguerias e outros negócios.
- **Purpose**: Fornecer uma base funcional completa, escalável e organizada, pronta para deploy comercial, com autenticação, multiempresa, banco real, CRUDs, agenda, área pública de agendamento, dashboards e módulos financeiros.
- **Target Users**:
  - Super Admin (proprietário da plataforma)
  - Administrador da empresa
  - Gerente
  - Recepcionista
  - Profissional
  - Cliente final

## Goals
- Criar landing page profissional com mensagem principal e CTA
- Implementar autenticação completa com Supabase Auth (login, cadastro, recuperação, confirmação)
- Arquitetura multi-tenant com RLS no Supabase
- Dashboard administrativo completo com indicadores e gráficos reais
- Agenda profissional com múltiplas visualizações
- Área pública de agendamento com fluxo em etapas
- CRM de clientes completo
- CRUD de serviços, profissionais, horários, bloqueios
- Módulos financeiros, comissões, relatórios
- Super Admin do SaaS
- Design moderno, responsivo e profissional
- Integração real com Supabase PostgreSQL e Auth
- Preparado para deploy na Vercel
- Suporte web e mobile (responsivo)

## Non-Goals
- Integração imediata com APIs de WhatsApp, Google Calendar, Mercado Pago, Stripe (apenas estrutura preparada)
- Geração de PDF/NF-e/NFC-e (apenas estrutura preparada)
- PWA com install prompt (apenas estrutura preparada)
- Aplicativo mobile nativo (apenas responsividade)
- Dados fictícios como solução definitiva - estrutura real para integração

## Background & Context
- Repositório novo (vazio) em `c:\xampp\htdocs\anasilvaclinica`
- Usuário prefere comunicação em Português
- Usuário prefere porta 8080 para servidor local
- Deve utilizar Supabase como banco e autenticação
- Deve estar preparado para deploy na Vercel

## Functional Requirements

### Landing Page (FR-LP)
- **FR-LP-1**: Hero com mensagem "Seu negócio organizado. Seus clientes agendados. Seu atendimento mais profissional."
- **FR-LP-2**: Botões: Começar grátis, Testar plataforma, Entrar
- **FR-LP-3**: Seções: Benefícios, Como funciona, Recursos, Para quem é, Demonstração, Planos, FAQ, CTA, Rodapé

### Autenticação (FR-AUTH)
- **FR-AUTH-1**: Login com e-mail/senha
- **FR-AUTH-2**: Cadastro de novo usuário/empresa
- **FR-AUTH-3**: Recuperação de senha por e-mail
- **FR-AUTH-4**: Alteração de senha
- **FR-AUTH-5**: Logout
- **FR-AUTH-6**: Confirmação de e-mail
- **FR-AUTH-7**: Perfil do usuário com edição
- **FR-AUTH-8**: Tipos de usuário: Super Admin, Administrador da empresa, Gerente, Recepcionista, Profissional, Cliente
- **FR-AUTH-9**: RBAC - controle de permissões por função

### Multi-Tenant (FR-MT)
- **FR-MT-1**: Tabela `companies` com todos os campos solicitados
- **FR-MT-2**: Todas as tabelas relacionadas possuem `company_id`
- **FR-MT-3**: Row Level Security (RLS) em todas as tabelas para isolar empresas
- **FR-MT-4**: URL pública `/agendar/{slug}` e `/empresa/{slug}`
- **FR-MT-5**: Slug único por empresa

### Cadastro da Empresa (FR-CE)
- **FR-CE-1**: Página de configuração inicial com todos os campos
- **FR-CE-2**: Tipos de negócio selecionáveis
- **FR-CE-3**: Upload de logo
- **FR-CE-4**: Configuração de cores personalizadas

### Dashboard Administrativo (FR-DA)
- **FR-DA-1**: Cards: Faturamento hoje, mês, Agendamentos hoje, mês, Serviços realizados, Clientes novos, ativos, Ticket médio, Taxa de cancelamento, Ocupação
- **FR-DA-2**: Gráfico de faturamento (dia/semana/mês)
- **FR-DA-3**: Gráfico de agendamentos por status
- **FR-DA-4**: Ranking de serviços mais vendidos
- **FR-DA-5**: Ranking de profissionais
- **FR-DA-6**: Indicadores de clientes (novos, recorrentes, inativos)
- **FR-DA-7**: Filtros de período
- **FR-DA-8**: Insights inteligentes calculados

### Agenda (FR-AG)
- **FR-AG-1**: Visualizações: Dia, Semana, Mês
- **FR-AG-2**: Cada agendamento mostra: horário, cliente, serviço, profissional, valor, status
- **FR-AG-3**: Cores diferentes por status (pending, confirmed, in_progress, completed, cancelled, no_show)
- **FR-AG-4**: Criar, editar, cancelar, confirmar, reagendar, concluir, marcar não compareceu
- **FR-AG-5**: Estrutura preparada para drag-and-drop

### Agendamento Manual (FR-AM)
- **FR-AM-1**: Formulário com seleção de cliente, serviço, profissional, data, horário
- **FR-AM-2**: Mostra apenas horários disponíveis
- **FR-AM-3**: Impede conflito de horários
- **FR-AM-4**: Campos: observações, valor, forma de pagamento, status

### Área Pública do Cliente (FR-APC)
- **FR-APC-1**: URL `/agendar/{slug}`
- **FR-APC-2**: Etapa 1: Escolher serviço (foto, nome, descrição, duração, preço)
- **FR-APC-3**: Etapa 2: Escolher profissional (foto, nome, especialidade, opção "qualquer")
- **FR-APC-4**: Etapa 3: Escolher data
- **FR-APC-5**: Etapa 4: Mostrar horários disponíveis (ocupa os já marcados)
- **FR-APC-6**: Etapa 5: Cliente informa dados (nome, telefone, WhatsApp, e-mail, observação)
- **FR-APC-7**: Etapa 6: Resumo + botão "Confirmar agendamento"
- **FR-APC-8**: Cliente não precisa criar conta no primeiro agendamento
- **FR-APC-9**: Associa cliente existente por telefone/e-mail automaticamente

### Área do Cliente Logada (FR-ACL)
- **FR-ACL-1**: Próximos agendamentos
- **FR-ACL-2**: Histórico completo
- **FR-ACL-3**: Serviços realizados, valores gastos
- **FR-ACL-4**: Perfil com dados pessoais editáveis
- **FR-ACL-5**: Reagendar, Cancelar, Agendar novamente
- **FR-ACL-6**: Seção "Agendar novamente" baseada no histórico

### Clientes / CRM (FR-CRM)
- **FR-CRM-1**: Lista de clientes com colunas: nome, telefone, e-mail, último atendimento, total gasto, qtd atendimentos, ticket médio, status
- **FR-CRM-2**: Busca por nome, telefone, e-mail
- **FR-CRM-3**: Página detalhada: informações pessoais, histórico completo, indicadores
- **FR-CRM-4**: CRUD de clientes

### Serviços (FR-SVC)
- **FR-SVC-1**: CRUD completo de serviços
- **FR-SVC-2**: Campos: nome, descrição, categoria, preço, duração, imagem, status
- **FR-SVC-3**: Categorias de serviços (CRUD)

### Profissionais (FR-PROF)
- **FR-PROF-1**: CRUD completo de profissionais
- **FR-PROF-2**: Campos: nome, foto, especialidade, telefone, e-mail, comissão, status
- **FR-PROF-3**: Cada profissional pode ter serviços que executa
- **FR-PROF-4**: Horário de trabalho próprio por profissional
- **FR-PROF-5**: Intervalos, folgas, férias, bloqueios

### Horários de Funcionamento (FR-HF)
- **FR-HF-1**: Configuração semanal (seg-dom)
- **FR-HF-2**: Para cada dia: aberto/fechado, horário inicial, horário final, intervalo

### Disponibilidade dos Profissionais (FR-DP)
- **FR-DP-1**: Horário próprio por profissional
- **FR-DP-2**: Folgas, férias, bloqueios, horários especiais

### Feriados e Bloqueios (FR-FB)
- **FR-FB-1**: Módulo "Bloqueios de agenda"
- **FR-FB-2**: Bloquear dia inteiro, horário específico, período
- **FR-FB-3**: Motivos: feriado, reunião, manutenção, folga, férias, outro

### Vendas (FR-VEND)
- **FR-VEND-1**: Cada serviço realizado registrado como venda
- **FR-VEND-2**: Campos: cliente, profissional, serviço, data, valor bruto, desconto, valor final, forma de pagamento, status
- **FR-VEND-3**: Formas de pagamento: dinheiro, pix, débito, crédito, outros
- **FR-VEND-4**: Dashboard de vendas com faturamento bruto/líquido, descontos, qtd vendas, ticket médio
- **FR-VEND-5**: Ranking de serviços, profissionais, clientes

### Financeiro (FR-FIN)
- **FR-FIN-1**: Indicadores: faturamento, recebimentos, pendentes, descontos, cancelamentos, ticket médio
- **FR-FIN-2**: Relatórios: faturamento por dia, serviço, profissional, forma de pagamento, período

### Ticket Médio (FR-TM)
- **FR-TM-1**: Cálculo automático: faturamento total / qtd vendas
- **FR-TM-2**: Ticket médio hoje, semanal, mensal
- **FR-TM-3**: Comparação com período anterior e variação percentual

### Comissões (FR-COM)
- **FR-COM-1**: Configurar percentual ou valor fixo por profissional
- **FR-COM-2**: Dashboard: comissão gerada, paga, pendente

### Relatórios (FR-REL)
- **FR-REL-1**: Relatórios: agendamentos, faturamento, serviços, clientes, profissionais, cancelamentos, comissão, ticket médio, taxa de ocupação
- **FR-REL-2**: Filtros por período
- **FR-REL-3**: Exportar CSV (PDF futuramente)

### Notificações (FR-NOTIF)
- **FR-NOTIF-1**: Estrutura de eventos: novo agendamento, confirmado, cancelado, reagendamento, lembrete
- **FR-NOTIF-2**: Arquitetura preparada para WhatsApp, e-mail, SMS

### Configurações (FR-CFG)
- **FR-CFG-1**: Abas: Empresa, Agenda, Agendamento, Pagamentos, Usuários, Permissões, Aparência
- **FR-CFG-2**: Configurações de antecedência, cancelamento, intervalo, etc.

### Menu Administrativo (FR-MENU)
- **FR-MENU-1**: Sidebar com todos os módulos
- **FR-MENU-2**: Topo: pesquisa global, notificações, perfil, empresa atual

### Super Admin (FR-SA)
- **FR-SA-1**: URL `/super-admin`
- **FR-SA-2**: Dashboard: empresas cadastradas/ativas/inativas, usuários, agendamentos totais, faturamento plataforma
- **FR-SA-3**: Gerenciar empresas, planos, assinaturas, usuários, configurações globais

### Planos do SaaS (FR-PLAN)
- **FR-PLAN-1**: Estrutura de planos: Gratuito, Básico, Profissional, Enterprise
- **FR-PLAN-2**: Banco preparado para integração Mercado Pago/Stripe

### Banco de Dados (FR-DB)
- **FR-DB-1**: Todas as tabelas com PK, FK, indexes, timestamps
- **FR-DB-2**: UUIDs em todas as PKs
- **FR-DB-3**: Soft delete onde aplicável
- **FR-DB-4**: Tabelas: profiles, companies, company_users, roles, permissions, clients, professionals, professional_services, services, service_categories, business_hours, professional_hours, schedule_blocks, holidays, appointments, appointment_status_history, sales, sale_items, payments, commissions, notifications, plans, subscriptions, settings, audit_logs

### Segurança (FR-SEC)
- **FR-SEC-1**: Supabase Auth integrado
- **FR-SEC-2**: RLS habilitado em todas as tabelas
- **FR-SEC-3**: Controle de acesso por empresa
- **FR-SEC-4**: Validação de dados e sanitização
- **FR-SEC-5**: SERVICE_ROLE_KEY apenas no backend
- **FR-SEC-6**: Variáveis de ambiente

### UX (FR-UX)
- **FR-UX-1**: Design clean, moderno, profissional
- **FR-UX-2**: Cards, tabelas, modais, dropdowns, toasts, skeletons, empty states, loading states, confirmation dialogs
- **FR-UX-3**: Navegação intuitiva

### Responsividade (FR-RESP)
- **FR-RESP-1**: Desktop, tablet, mobile
- **FR-RESP-2**: Mobile: sidebar vira menu hambúrguer
- **FR-RESP-3**: Agenda utilizável no mobile
- **FR-RESP-4**: Área pública de agendamento com UX de app moderno

### Regras de Agendamento (FR-REGRAS)
- **FR-REGRAS-1**: Valida profissional disponível
- **FR-REGRAS-2**: Valida serviço disponível para profissional
- **FR-REGRAS-3**: Valida horário de funcionamento
- **FR-REGRAS-4**: Valida horário do profissional
- **FR-REGRAS-5**: Valida bloqueios e feriados
- **FR-REGRAS-6**: Valida conflitos considerando duração do serviço

### Status dos Agendamentos (FR-STATUS)
- **FR-STATUS-1**: Status: pending, confirmed, in_progress, completed, cancelled, no_show
- **FR-STATUS-2**: Tabela `appointment_status_history` com histórico de alterações

### Dashboard Inteligente (FR-DI)
- **FR-DI-1**: Insights dinâmicos calculados a partir dos dados reais

### Busca Global (FR-SG)
- **FR-SG-1**: Pesquisar cliente, agendamento, serviço, profissional no topo

### Auditoria (FR-AUD)
- **FR-AUD-1**: Tabela de logs com login, criação, alteração, exclusão, cancelamento, alteração de configuração
- **FR-AUD-2**: Campos: user_id, company_id, action, entity, entity_id, old_data, new_data, created_at

### Seed/Demonstração (FR-SEED)
- **FR-SEED-1**: Empresa "Studio Bella"
- **FR-SEED-2**: Serviços: Corte, Escova, Manicure, Pedicure, Design de sobrancelha
- **FR-SEED-3**: Profissionais: Ana, Juliana, Carlos
- **FR-SEED-4**: Clientes e agendamentos de demonstração

### Estrutura do Projeto (FR-EST)
- **FR-EST-1**: Pastas: /components, /pages, /layouts, /hooks, /services, /lib, /utils, /types, /api, /database
- **FR-EST-2**: Componentes reutilizáveis, sem duplicação

### Integrações Futuras (FR-INT)
- **FR-INT-1**: Arquitetura preparada para WhatsApp, Google Calendar, Mercado Pago, Stripe, Pix, E-mail, SMS, NF-e, PWA, Mobile

## Non-Functional Requirements
- **NFR-1**: Frontend: React + JavaScript com Next.js (para deploy Vercel)
- **NFR-2**: Backend: Node.js / API Routes do Next.js
- **NFR-3**: Banco: Supabase PostgreSQL
- **NFR-4**: UI: Tailwind CSS
- **NFR-5**: Ícones: Lucide React
- **NFR-6**: Gráficos: Recharts
- **NFR-7**: Formulários com validação (React Hook Form + Zod ou similar)
- **NFR-8**: Deploy preparado para Vercel
- **NFR-9**: Mensagens de erro amigáveis
- **NFR-10**: Tratamento de erros global
- **NFR-11**: Arquivo `.env.example` com variáveis necessárias (sem chaves reais)

## Constraints
- **Technical**:
  - React + JavaScript (não TypeScript)
  - Node.js
  - Supabase PostgreSQL + Auth
  - Tailwind CSS
  - Lucide React
  - Recharts
  - Vercel deploy
  - SERVICE_ROLE_KEY nunca no frontend
- **Business**:
  - Não utilizar dados fictícios como solução definitiva
  - Todas as principais funcionalidades devem funcionar de verdade
  - Aparência de SaaS profissional comercial
- **Dependencies**:
  - Conta Supabase (usuário configura)
  - Projeto Next.js para rotas

## Assumptions
- Usuário irá configurar as variáveis SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- Usuário possui conta Supabase com projeto criado
- Seed de dados é para demonstração, não dados fictícios permanentes
- Drag-and-drop da agenda é estrutura preparada, não implementado DnD completo
- Cobrança recorrente é estrutura preparada no banco, sem gateway ativo
- PDF/NF-e é estrutura preparada, não implementado

## Acceptance Criteria

### AC-1: Estrutura do projeto inicializada
- **Type**: `rule`
- **Given**: Repositório vazio
- **When**: Inicializar projeto Next.js + React + Tailwind + Supabase
- **Then**: Projeto compila, roda `npm run dev` na porta 8080 sem erros
- **Pass Condition**: `npm run dev` inicia sem erros e página inicial carrega
- **Evidence**: Saída do comando de inicialização e acesso à página inicial

### AC-2: Landing Page completa
- **Type**: `rubric`
- **Dimension**: Completude e qualidade visual da landing page
- **Scale**: 1-5
- **Anchors**: 1 = apenas hero básico; 3 = todas seções presentes mas sem estilo; 5 = todas seções, design profissional moderno, responsivo, CTAs funcionais
- **Pass Threshold**: >= 4
- **Evidence**: Screenshot e inspeção visual das seções

### AC-3: Autenticação Supabase integrada
- **Type**: `rule`
- **Given**: Páginas /login e /cadastro criadas
- **When**: Usuário faz login, cadastro e recuperação de senha
- **Then**: Autenticação Supabase funciona, sessão persistente, usuário logado acessa /dashboard
- **Pass Condition**: Fluxo completo de auth funciona (após configuração de chaves)
- **Evidence**: Código de integração Supabase Auth, páginas de auth criadas, middleware de rotas protegidas

### AC-4: Tabelas Supabase + RLS
- **Type**: `rule`
- **Given**: Migrations SQL criadas
- **When**: Aplicar migrations no Supabase
- **Then**: Todas as tabelas existem com PK, FK, indexes, RLS habilitado e policies corretas
- **Pass Condition**: SQL de migrations válido e RLS policies corretas para multi-tenant
- **Evidence**: Arquivos .sql de migrations com todas as tabelas e policies

### AC-5: CRUD Serviços
- **Type**: `rule`
- **Given**: Tabela services criada
- **When**: Usuário acessa /servicos, cria, edita, lista e inativa serviço
- **Then**: Dados persistem no Supabase respeitando company_id e RLS
- **Pass Condition**: CRUD 4 operações funcionam
- **Evidence**: Código das páginas/API e funcionalidade testada

### AC-6: CRUD Profissionais
- **Type**: `rule`
- **Given**: Tabela professionals criada
- **When**: Usuário acessa /profissionais e executa CRUD + serviços vinculados
- **Then**: Dados persistem com relacionamentos
- **Pass Condition**: CRUD + vinculação de serviços funcionam
- **Evidence**: Código e funcionalidade

### AC-7: CRUD Clientes (CRM)
- **Type**: `rule`
- **Given**: Tabela clients criada
- **When**: Pesquisa, listagem, página detalhada, criação e edição
- **Then**: Funciona com filtros e indicadores na página detalhada
- **Pass Condition**: Todas funcionalidades CRM
- **Evidence**: Código e funcionalidade

### AC-8: Agenda com visualizações
- **Type**: `rubric`
- **Dimension**: Qualidade e funcionalidade da agenda
- **Scale**: 1-5
- **Anchors**: 1 = apenas lista; 3 = visualizações dia/semana/mês mas sem cores/status; 5 = 3 visualizações, cores por status, ações CRUD, conflitos impedidos, responsiva
- **Pass Threshold**: >= 4
- **Evidence**: Screenshot e fluxo de criação/edição de agendamento

### AC-9: Área pública de agendamento
- **Type**: `rule`
- **Given**: Empresa "Studio Bella" cadastrada com slug
- **When**: Cliente acessa /agendar/studio-bella e segue fluxo de 6 etapas
- **Then**: Agendamento é criado no banco associado à empresa correta
- **Pass Condition**: Fluxo completo cria agendamento sem erros
- **Evidence**: Fluxo passo a passo e registro no banco

### AC-10: Dashboard administrativo
- **Type**: `rubric`
- **Dimension**: Completude e qualidade do dashboard
- **Scale**: 1-5
- **Anchors**: 1 = apenas 2 cards estáticos; 3 = cards e gráficos mas dados mock; 5 = todos cards, gráficos Recharts com dados reais, filtros, insights dinâmicos
- **Pass Threshold**: >= 4
- **Evidence**: Código de queries e gráficos funcionando

### AC-11: Vendas e Financeiro
- **Type**: `rule`
- **Given**: Serviços e agendamentos existem
- **When**: Serviço é concluído e venda é registrada
- **Then**: Faturamento aparece nos relatórios, ticket médio calcula, formas de pagamento categorizam
- **Pass Condition**: Módulo financeiro calcula corretamente
- **Evidence**: Cálculos de faturamento e ticket médio

### AC-12: Comissões
- **Type**: `rule`
- **Given**: Profissional com comissão 30% cadastrado
- **When**: Venda de R$100 concluída
- **Then**: Comissão de R$30 gerada para o profissional
- **Pass Condition**: Cálculo percentual e fixo corretos
- **Evidence**: Cálculo de comissão correto

### AC-13: Multi-tenant / RLS
- **Type**: `rule`
- **Given**: 2 empresas cadastradas (Empresa A e B)
- **When**: Usuário da Empresa A faz consulta de agendamentos/serviços/clientes
- **Then**: Nenhum dado da Empresa B é retornado
- **Pass Condition**: Isolamento de dados por empresa funciona
- **Evidence**: Policies RLS e teste de consulta

### AC-14: Super Admin
- **Type**: `rule`
- **Given**: Usuário com papel super_admin
- **When**: Acessa /super-admin
- **Then**: Vê todas as empresas, usuários, métricas da plataforma, gerencia planos
- **Pass Condition**: Dashboard e CRUDs do Super Admin
- **Evidence**: Páginas e permissões

### AC-15: Relatórios e CSV
- **Type**: `rule`
- **Given**: Período selecionado
- **When**: Clica em exportar CSV
- **Then**: Arquivo CSV baixado com dados corretos
- **Pass Condition**: Export CSV funcional
- **Evidence**: Download de CSV válido

### AC-16: Responsividade Mobile
- **Type**: `rubric`
- **Dimension**: Qualidade da experiência mobile
- **Scale**: 1-5
- **Anchors**: 1 = quebra de layout; 3 = carrega mas com overflow; 5 = menu hambúrguer, cards empilhados, agenda utilizável, formulários 100% largura, área de agendar como app
- **Pass Threshold**: >= 4
- **Evidence**: Screenshot em viewport mobile (375px)

### AC-17: Sidebar e navegação
- **Type**: `rule`
- **Given**: Usuário logado como admin
- **When**: Navega pelos menus
- **Then**: Sidebar com todos os itens, topo com busca/notificações/perfil/empresa, rotas protegidas carregam
- **Pass Condition**: Navegação completa e funcionando
- **Evidence**: Layout e roteamento

### AC-18: Busca Global
- **Type**: `rule`
- **Given**: Pesquisa inserida no topo
- **When**: Digita nome de cliente/profissional/serviço
- **Then**: Resultados aparecem com links para páginas detalhadas
- **Pass Condition**: Busca retorna resultados corretos
- **Evidence**: Query de busca multipla tabela

### AC-19: Auditoria / Logs
- **Type**: `rule`
- **Given**: Usuário altera/exclui algo
- **When**: Operação executada
- **Then**: Registro criado em audit_logs com old_data e new_data
- **Pass Condition**: Logs persistidos
- **Evidence**: Tabela audit_logs e triggers/hooks de registro

### AC-20: Seed de demonstração
- **Type**: `rule`
- **Given**: Migration seed aplicada
- **When**: Consulta tabelas
- **Then**: Studio Bella, serviços, profissionais, clientes e agendamentos de demo existem
- **Pass Condition**: Dados de demonstração presentes
- **Evidence**: SQL de seed e consulta

### AC-21: .env.example criado
- **Type**: `rule`
- **Given**: Projeto criado
- **When**: Verifica arquivo raiz
- **Then**: .env.example existe com SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- **Pass Condition**: Arquivo existe com variáveis sem valores reais
- **Evidence**: Arquivo .env.example

### AC-22: Vercel deploy preparado
- **Type**: `rule`
- **Given**: Projeto final
- **When**: vercel.json e next.config.js presentes
- **Then**: Builda sem erros com `npm run build`
- **Pass Condition**: `npm run build` executar sem erros
- **Evidence**: Saída do comando build

## Open Questions
- [ ] O usuário já possui projeto Supabase criado? Se sim, posso usar as chaves? (Criaremos .env.example)
- [ ] Confirmar Next.js App Router ou Pages Router? (Usaremos Pages Router para simplicidade inicial)
- [ ] Biblioteca de formulários: React Hook Form + Zod ok?
- [ ] Data/horário: utilizar date-fns ou dayjs? (Usaremos date-fns)
