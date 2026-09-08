import React from "react";
import Head from "next/head";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import EmptyState from "@/components/ui/EmptyState";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import RoleGuard from "@/components/auth/RoleGuard";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Users,
  CalendarDays,
  Wallet,
  Crown,
  Shield,
  Sparkles,
  Edit2,
  CreditCard,
  Settings,
  Save,
  DollarSign,
  FileCheck2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import AdminLayout, { getLayout } from "@/layouts/AdminLayout";
import { formatCurrency, formatNumber } from "@/utils/format";
import { cn } from "@/utils/cn";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    period: "/mês",
    color: "from-slate-500 to-slate-700",
    tag: "Básico",
    features: [
      "Até 5 usuários",
      "Agenda ilimitada",
      "Clientes ilimitados",
      "Suporte por email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    period: "/mês",
    color: "from-brand-500 to-brand-700",
    tag: "Mais popular",
    features: [
      "Até 15 usuários",
      "Agenda ilimitada",
      "Clientes ilimitados",
      "Relatórios avançados",
      "Suporte prioritário",
      "Integração WhatsApp",
    ],
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    price: 199,
    period: "/mês",
    color: "from-purple-500 to-purple-700",
    tag: "Empresas",
    features: [
      "Usuários ilimitados",
      "Multi-empresa",
      "API de integração",
      "Gestor de conta dedicado",
      "SLA 99.9%",
      "Onboarding personalizado",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 499,
    period: "/mês",
    color: "from-amber-500 to-amber-700",
    tag: "Corporativo",
    features: [
      "Tudo do Business",
      "Customizações",
      "SSO / SAML",
      "Auditoria avançada",
      "Suporte 24/7",
      "Contrato anual",
    ],
  },
];

export default function SuperAdminPage() {
  const { toast } = useToast();
  const [tab, setTab] = React.useState("empresas");
  const [globalTax, setGlobalTax] = React.useState(7.5);
  const [saving, setSaving] = React.useState(false);

  const cards = [
    {
      title: "Empresas Cadastradas",
      value: formatNumber(142),
      icon: Building2,
      color: "bg-brand-50 text-brand-600",
    },
    {
      title: "Empresas Ativas",
      value: formatNumber(128),
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Empresas Inativas",
      value: formatNumber(14),
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Usuários Plataforma",
      value: formatNumber(847),
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Agendamentos Totais",
      value: formatNumber(48921),
      icon: CalendarDays,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Faturamento Plataforma",
      value: formatCurrency(342150.5),
      icon: Wallet,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  const handleSaveGlobal = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast({
      title: "Configurações globais salvas!",
      variant: "success",
    });
  };

  return (
    <RoleGuard roles={["super_admin"]} fallback={
      <div className="flex h-full w-full items-center justify-center py-20">
        <Card className="max-w-md w-full">
          <CardBody className="text-center">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              Acesso Restrito
            </h2>
            <p className="text-sm text-slate-500">
              Esta área é exclusiva para usuários com privilégios de Super Administrador.
            </p>
          </CardBody>
        </Card>
      </div>
    }>
      <Head>
        <title>Super Admin | AgendPro</title>
      </Head>
      <div className="space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center shadow-lg shadow-purple-200">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Super Admin
              <Badge variant="info" className="text-[10px] !px-2.5">
                Plataforma
              </Badge>
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Gestão global da plataforma AgendPro
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Card key={c.title}>
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-slate-500">{c.title}</p>
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center",
                      c.color
                    )}
                  >
                    <c.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">
                  {c.value}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <CardBody className="!p-0">
            <Tabs value={tab} onValueChange={setTab} defaultValue="empresas">
              <div className="border-b border-slate-200 px-4 pt-3">
                <TabsList className="!border-0 !p-0 flex-wrap">
                  {[
                    { v: "empresas", l: "Empresas", i: Building2 },
                    { v: "planos", l: "Planos", i: Crown },
                    { v: "assinaturas", l: "Assinaturas", i: CreditCard },
                    { v: "usuarios", l: "Usuários", i: Users },
                    { v: "configuracoes", l: "Configurações", i: Settings },
                  ].map(({ v, l, i: Icon }) => (
                    <TabsTrigger
                      key={v}
                      value={v}
                      className="gap-1.5 !py-2 !px-3"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{l}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="empresas" className="!mt-0">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Empresas da Plataforma
                      </h3>
                      <p className="text-sm text-slate-500">
                        Lista completa de empresas cadastradas
                      </p>
                    </div>
                    <Button icon={<Sparkles className="h-4 w-4" />} variant="outline">
                      Nova Empresa
                    </Button>
                  </div>
                  <Table hasData={false} colSpan={6}>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead className="text-right">Usuários</TableHead>
                        <TableHead className="text-right">Criada em</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody />
                  </Table>
                  <EmptyState
                    icon={Building2}
                    title="Sem empresas para listar ainda."
                    description="As empresas aparecerão aqui assim que forem criadas."
                  />
                </div>
              </TabsContent>

              <TabsContent value="planos" className="!mt-0">
                <div className="p-6 space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Planos da Plataforma
                    </h3>
                    <p className="text-sm text-slate-500">
                      Defina os planos e preços oferecidos aos clientes
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {PLANS.map((p) => (
                      <div
                        key={p.id}
                        className={cn(
                          "relative rounded-2xl border bg-white overflow-hidden",
                          p.popular
                            ? "border-brand-500 shadow-xl shadow-brand-200/50 ring-2 ring-brand-200"
                            : "border-slate-200"
                        )}
                      >
                        {p.popular && (
                          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-brand-500 to-brand-700 text-white text-xs font-semibold text-center py-1.5">
                            {p.tag}
                          </div>
                        )}
                        <div className={cn("p-5 pb-0", p.popular && "pt-10")}>
                          <div
                            className={cn(
                              "h-12 w-12 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-sm mb-4",
                              p.color
                            )}
                          >
                            <Crown className="h-6 w-6" />
                          </div>
                          <div className="flex items-end gap-1 mb-1">
                            <span className="text-3xl font-bold text-slate-900 tracking-tight">
                              R${p.price}
                            </span>
                            <span className="text-sm text-slate-500 mb-1.5">
                              {p.period}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-900 mb-3">
                            {p.name}
                          </p>
                        </div>
                        <div className="px-5">
                          <ul className="space-y-2 border-t border-slate-100 py-4">
                            {p.features.map((f) => (
                              <li
                                key={f}
                                className="text-sm text-slate-600 flex items-start gap-2"
                              >
                                <FileCheck2 className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-5 pt-0">
                          <Button
                            variant={p.popular ? "primary" : "outline"}
                            size="sm"
                            icon={<Edit2 className="h-4 w-4" />}
                            className="w-full"
                            onClick={() =>
                              toast({
                                title: "Editar plano",
                                description: `${p.name}`,
                                variant: "info",
                              })
                            }
                          >
                            Editar Plano
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="assinaturas" className="!mt-0">
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Assinaturas Ativas
                    </h3>
                    <p className="text-sm text-slate-500">
                      Acompanhe as assinaturas e pagamentos recorrentes
                    </p>
                  </div>
                  <Table hasData={false} colSpan={6}>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead>Próximo Vencimento</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody />
                  </Table>
                  <EmptyState
                    icon={CreditCard}
                    title="Nenhuma assinatura listada."
                    description="As assinaturas ativas aparecerão aqui."
                  />
                </div>
              </TabsContent>

              <TabsContent value="usuarios" className="!mt-0">
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Todos os Usuários da Plataforma
                    </h3>
                    <p className="text-sm text-slate-500">
                      Visão global de todos os usuários cadastrados
                    </p>
                  </div>
                  <Table hasData={false} colSpan={5}>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody />
                  </Table>
                  <EmptyState
                    icon={Users}
                    title="Sem usuários listados."
                    description="A lista completa aparecerá aqui."
                  />
                </div>
              </TabsContent>

              <TabsContent value="configuracoes" className="!mt-0">
                <div className="p-6 space-y-6 max-w-3xl">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Configurações Globais
                    </h3>
                    <p className="text-sm text-slate-500">
                      Parâmetros que afetam toda a plataforma
                    </p>
                  </div>
                  <Card className="border-dashed">
                    <CardBody className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="font-semibold text-sm text-slate-900">
                              Taxa de Plataforma (%)
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Percentual cobrado sobre cada transação realizada
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Input
                              label="Taxa padrão"
                              type="number"
                              step="0.1"
                              value={globalTax}
                              onChange={(e) =>
                                setGlobalTax(Number(e.target.value))
                              }
                              helperText={`Hoje: ${globalTax}% por transação`}
                            />
                            <Input
                              label="Taxa mínima (R$)"
                              type="number"
                              step="0.01"
                              defaultValue={0.5}
                            />
                            <Input
                              label="Taxa máxima (R$)"
                              type="number"
                              step="0.01"
                              placeholder="Sem teto"
                            />
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nome da plataforma"
                      defaultValue="AgendPro"
                    />
                    <Input
                      label="URL Suporte"
                      type="url"
                      defaultValue="https://suporte.agendpro.com.br"
                    />
                    <Input
                      label="Email Contato"
                      type="email"
                      defaultValue="suporte@agendpro.com.br"
                    />
                    <Input
                      label="WhatsApp Suporte"
                      defaultValue="+55 (11) 99999-0000"
                    />
                  </div>
                  <div className="flex justify-end pt-2 gap-2">
                    <Button variant="outline">Restaurar Padrões</Button>
                    <Button
                      icon={<Save className="h-4 w-4" />}
                      loading={saving}
                      onClick={handleSaveGlobal}
                    >
                      Salvar Configurações
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}

SuperAdminPage.getLayout = getLayout;
