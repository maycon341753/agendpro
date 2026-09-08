import React, { useState } from "react";
import Head from "next/head";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import {
  Building2,
  CalendarClock,
  CalendarDays,
  Wallet,
  Users,
  Shield,
  Palette,
  Save,
  Plus,
  Check,
  X,
  Sun,
  Moon,
  Edit2,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import AdminLayout, { getLayout } from "@/layouts/AdminLayout";
import { BUSINESS_TYPES, DAYS_OF_WEEK, PAYMENT_METHODS } from "@/utils/constants";
import { cn } from "@/utils/cn";

const ROLES = [
  { id: "owner", name: "Proprietário" },
  { id: "admin", name: "Administrador" },
  { id: "manager", name: "Gerente" },
  { id: "professional", name: "Profissional" },
  { id: "receptionist", name: "Recepcionista" },
];

const PERMISSIONS_MATRIX = [
  { key: "dashboard.view", label: "Ver Dashboard" },
  { key: "appointments.view", label: "Ver Agendamentos" },
  { key: "appointments.create", label: "Criar Agendamento" },
  { key: "appointments.edit", label: "Editar Agendamento" },
  { key: "appointments.cancel", label: "Cancelar Agendamento" },
  { key: "clients.view", label: "Ver Clientes" },
  { key: "clients.create", label: "Criar Cliente" },
  { key: "clients.edit", label: "Editar Cliente" },
  { key: "services.view", label: "Ver Serviços" },
  { key: "services.create", label: "Criar Serviço" },
  { key: "services.edit", label: "Editar Serviço" },
  { key: "sales.view", label: "Ver Vendas" },
  { key: "sales.create", label: "Lançar Venda" },
  { key: "financial.view", label: "Ver Financeiro" },
  { key: "settings.view", label: "Ver Configurações" },
  { key: "settings.edit", label: "Editar Configurações" },
  { key: "reports.view", label: "Ver Relatórios" },
];

const ROLE_PERMS = {
  owner: PERMISSIONS_MATRIX.map(() => true),
  admin: PERMISSIONS_MATRIX.map((_, i) => i < 15),
  manager: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1].map((v) => !!v),
  professional: [1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0].map((v) => !!v),
  receptionist: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0].map((v) => !!v),
};

export default function ConfiguracoesPage() {
  const { company, profile } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("empresa");
  const [saving, setSaving] = useState(false);

  const [empresa, setEmpresa] = useState({
    name: company?.name || "Ana Silva Clínica",
    fantasy_name: company?.fantasy_name || "Ana Silva Estética",
    document: "12.345.678/0001-90",
    email: "contato@anasilvaclinica.com.br",
    phone: "(11) 99999-9999",
    whatsapp: "(11) 99999-9999",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    zip_code: "01234-567",
    logo_url: "",
    color_primary: company?.color_primary || "#2563eb",
    color_secondary: company?.color_secondary || "#8b5cf6",
    slug: company?.slug || "ana-silva-clinica",
    business_type: "estetica",
  });

  const [businessHours, setBusinessHours] = useState(
    DAYS_OF_WEEK.map((d) => ({
      day: d.value,
      enabled: d.value >= 1 && d.value <= 5,
      open_time: "08:00",
      close_time: "19:00",
      break_start: "12:00",
      break_end: "13:00",
    }))
  );

  const [agendamento, setAgendamento] = useState({
    min_antecedence_min: 60,
    max_antecedence_days: 60,
    allow_cancel: true,
    min_cancel_hours: 24,
    slot_interval: 30,
  });

  const [payments, setPayments] = useState(
    PAYMENT_METHODS.reduce((acc, m) => {
      acc[m.value] = true;
      return acc;
    }, {})
  );

  const [appearance, setAppearance] = useState({
    logo_url: empresa.logo_url,
    color_primary: empresa.color_primary,
    color_secondary: empresa.color_secondary,
    theme: "light",
  });

  const handleSave = async (section) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast({
      title: "Configurações salvas!",
      description: `Seção: ${section}`,
      variant: "success",
    });
  };

  const updateBusinessHour = (day, field, value) => {
    setBusinessHours((h) =>
      h.map((item) => (item.day === day ? { ...item, [field]: value } : item))
    );
  };

  return (
    <>
      <Head>
        <title>Configurações | AgendPro</title>
      </Head>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Configurações
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Personalize o sistema de acordo com o seu negócio
          </p>
        </div>

        <Card>
          <CardBody className="!p-0">
            <Tabs value={tab} onValueChange={setTab} defaultValue="empresa">
              <div className="border-b border-slate-200 px-4 pt-3">
                <TabsList className="!border-0 !p-0">
                  {[
                    { v: "empresa", l: "Empresa", i: Building2 },
                    { v: "agenda", l: "Agenda", i: CalendarClock },
                    { v: "agendamento", l: "Agendamento", i: CalendarDays },
                    { v: "pagamentos", l: "Pagamentos", i: Wallet },
                    { v: "usuarios", l: "Usuários", i: Users },
                    { v: "permissoes", l: "Permissões", i: Shield },
                    { v: "aparencia", l: "Aparência", i: Palette },
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

              <TabsContent value="empresa" className="!mt-0">
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Input
                      label="Nome (Razão Social)"
                      required
                      value={empresa.name}
                      onChange={(e) =>
                        setEmpresa({ ...empresa, name: e.target.value })
                      }
                    />
                    <Input
                      label="Nome Fantasia"
                      value={empresa.fantasy_name}
                      onChange={(e) =>
                        setEmpresa({ ...empresa, fantasy_name: e.target.value })
                      }
                    />
                    <Select
                      label="Tipo de Negócio"
                      required
                      options={BUSINESS_TYPES}
                      value={empresa.business_type}
                      onChange={(e) =>
                        setEmpresa({ ...empresa, business_type: e.target.value })
                      }
                    />
                    <Input
                      label="CNPJ / CPF"
                      value={empresa.document}
                      onChange={(e) =>
                        setEmpresa({ ...empresa, document: e.target.value })
                      }
                    />
                    <Input
                      label="E-mail"
                      type="email"
                      value={empresa.email}
                      onChange={(e) =>
                        setEmpresa({ ...empresa, email: e.target.value })
                      }
                    />
                    <Input
                      label="Telefone"
                      value={empresa.phone}
                      onChange={(e) =>
                        setEmpresa({ ...empresa, phone: e.target.value })
                      }
                    />
                    <Input
                      label="WhatsApp"
                      value={empresa.whatsapp}
                      onChange={(e) =>
                        setEmpresa({ ...empresa, whatsapp: e.target.value })
                      }
                    />
                    <Input
                      label="Endereço"
                      className="md:col-span-2 lg:col-span-2"
                      value={empresa.address}
                      onChange={(e) =>
                        setEmpresa({ ...empresa, address: e.target.value })
                      }
                    />
                    <Input
                      label="Cidade"
                      value={empresa.city}
                      onChange={(e) =>
                        setEmpresa({ ...empresa, city: e.target.value })
                      }
                    />
                    <Input
                      label="Estado (UF)"
                      maxLength={2}
                      value={empresa.state}
                      onChange={(e) =>
                        setEmpresa({
                          ...empresa,
                          state: e.target.value.toUpperCase(),
                        })
                      }
                    />
                    <Input
                      label="CEP"
                      value={empresa.zip_code}
                      onChange={(e) =>
                        setEmpresa({ ...empresa, zip_code: e.target.value })
                      }
                    />
                    <Input
                      label="URL do Logo"
                      className="md:col-span-2 lg:col-span-3"
                      placeholder="https://..."
                      value={empresa.logo_url}
                      onChange={(e) =>
                        setEmpresa({ ...empresa, logo_url: e.target.value })
                      }
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Cor Primária
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={empresa.color_primary}
                          onChange={(e) =>
                            setEmpresa({ ...empresa, color_primary: e.target.value })
                          }
                          className="h-10 w-14 rounded-lg border border-slate-300 cursor-pointer bg-white p-1"
                        />
                        <Input
                          value={empresa.color_primary}
                          onChange={(e) =>
                            setEmpresa({ ...empresa, color_primary: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Cor Secundária
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={empresa.color_secondary}
                          onChange={(e) =>
                            setEmpresa({ ...empresa, color_secondary: e.target.value })
                          }
                          className="h-10 w-14 rounded-lg border border-slate-300 cursor-pointer bg-white p-1"
                        />
                        <Input
                          value={empresa.color_secondary}
                          onChange={(e) =>
                            setEmpresa({ ...empresa, color_secondary: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <Input
                      label="Slug (URL do agendamento)"
                      value={empresa.slug}
                      onChange={(e) =>
                        setEmpresa({ ...empresa, slug: e.target.value })
                      }
                      helperText="Ex: anasilvaclinica.agendpro.com.br"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      icon={<Save className="h-4 w-4" />}
                      loading={saving}
                      onClick={() => handleSave("Empresa")}
                    >
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="agenda" className="!mt-0">
                <div className="p-6 space-y-4">
                  <div className="bg-brand-50/60 border border-brand-200 rounded-lg p-4 text-sm text-brand-800">
                    Defina os horários de funcionamento da sua agenda para cada dia da semana.
                  </div>
                  <div className="space-y-3">
                    {businessHours.map((bh) => {
                      const dayLabel = DAYS_OF_WEEK.find((d) => d.value === bh.day)?.label;
                      return (
                        <div
                          key={bh.day}
                          className={cn(
                            "rounded-xl border transition-all",
                            bh.enabled
                              ? "border-slate-200 bg-white"
                              : "border-slate-200 bg-slate-50/60 opacity-70"
                          )}
                        >
                          <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-3 min-w-[180px]">
                              <label
                                className={cn(
                                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                                  bh.enabled ? "bg-brand-600" : "bg-slate-300"
                                )}
                              >
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={bh.enabled}
                                  onChange={(e) =>
                                    updateBusinessHour(bh.day, "enabled", e.target.checked)
                                  }
                                />
                                <span
                                  className={cn(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 translate-x-0.5",
                                    bh.enabled && "translate-x-5"
                                  )}
                                />
                              </label>
                              <div>
                                <p
                                  className={cn(
                                    "font-semibold text-sm",
                                    bh.enabled ? "text-slate-900" : "text-slate-500"
                                  )}
                                >
                                  {dayLabel}
                                </p>
                                <Badge
                                  variant={bh.enabled ? "success" : "muted"}
                                  className="mt-0.5 text-[10px]"
                                >
                                  {bh.enabled ? "Aberto" : "Fechado"}
                                </Badge>
                              </div>
                            </div>
                            {bh.enabled && (
                              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <Input
                                  label="Abre"
                                  type="time"
                                  size="sm"
                                  value={bh.open_time}
                                  onChange={(e) =>
                                    updateBusinessHour(bh.day, "open_time", e.target.value)
                                  }
                                />
                                <Input
                                  label="Fecha"
                                  type="time"
                                  size="sm"
                                  value={bh.close_time}
                                  onChange={(e) =>
                                    updateBusinessHour(bh.day, "close_time", e.target.value)
                                  }
                                />
                                <Input
                                  label="Intervalo início"
                                  type="time"
                                  size="sm"
                                  value={bh.break_start}
                                  onChange={(e) =>
                                    updateBusinessHour(bh.day, "break_start", e.target.value)
                                  }
                                />
                                <Input
                                  label="Intervalo fim"
                                  type="time"
                                  size="sm"
                                  value={bh.break_end}
                                  onChange={(e) =>
                                    updateBusinessHour(bh.day, "break_end", e.target.value)
                                  }
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      icon={<Save className="h-4 w-4" />}
                      loading={saving}
                      onClick={() => handleSave("Horário de funcionamento")}
                    >
                      Salvar Horários
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="agendamento" className="!mt-0">
                <div className="p-6 space-y-6 max-w-3xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Antecedência Mínima (minutos)"
                      type="number"
                      min={0}
                      value={agendamento.min_antecedence_min}
                      onChange={(e) =>
                        setAgendamento({
                          ...agendamento,
                          min_antecedence_min: Number(e.target.value),
                        })
                      }
                      helperText="Tempo mínimo antes do horário para agendar"
                    />
                    <Input
                      label="Antecedência Máxima (dias)"
                      type="number"
                      min={1}
                      value={agendamento.max_antecedence_days}
                      onChange={(e) =>
                        setAgendamento({
                          ...agendamento,
                          max_antecedence_days: Number(e.target.value),
                        })
                      }
                      helperText="Prazo máximo para agendar à frente"
                    />
                    <Input
                      label="Intervalo entre horários (min)"
                      type="number"
                      min={5}
                      step={5}
                      value={agendamento.slot_interval}
                      onChange={(e) =>
                        setAgendamento({
                          ...agendamento,
                          slot_interval: Number(e.target.value),
                        })
                      }
                    />
                    <div className="flex items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Permitir cancelamento pelo cliente
                        </label>
                        <label
                          className={cn(
                            "relative inline-flex h-10 w-20 cursor-pointer rounded-full border-2 border-transparent transition-colors items-center",
                            agendamento.allow_cancel ? "bg-green-500" : "bg-slate-300"
                          )}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={agendamento.allow_cancel}
                            onChange={(e) =>
                              setAgendamento({
                                ...agendamento,
                                allow_cancel: e.target.checked,
                              })
                            }
                          />
                          <span
                            className={cn(
                              "pointer-events-none inline-flex h-8 w-8 transform rounded-full bg-white shadow ring-0 transition duration-200 translate-x-1 items-center justify-center",
                              agendamento.allow_cancel && "translate-x-11"
                            )}
                          >
                            {agendamento.allow_cancel ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-slate-400" />
                            )}
                          </span>
                        </label>
                      </div>
                    </div>
                    <Input
                      label="Tempo mínimo p/ cancelamento (horas)"
                      type="number"
                      min={0}
                      disabled={!agendamento.allow_cancel}
                      value={agendamento.min_cancel_hours}
                      onChange={(e) =>
                        setAgendamento({
                          ...agendamento,
                          min_cancel_hours: Number(e.target.value),
                        })
                      }
                      helperText="Antes do horário agendado"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      icon={<Save className="h-4 w-4" />}
                      loading={saving}
                      onClick={() => handleSave("Regras de agendamento")}
                    >
                      Salvar Regras
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pagamentos" className="!mt-0">
                <div className="p-6 space-y-4 max-w-3xl">
                  <div className="bg-green-50/60 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                    Selecione quais formas de pagamento você aceita no seu estabelecimento.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map((m) => {
                      const active = payments[m.value];
                      return (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() =>
                            setPayments({
                              ...payments,
                              [m.value]: !active,
                            })
                          }
                          className={cn(
                            "flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all",
                            active
                              ? "border-brand-500 bg-brand-50/50"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border",
                                active
                                  ? "border-brand-200 bg-white text-brand-600"
                                  : "border-slate-200 bg-slate-50 text-slate-400"
                              )}
                            >
                              <Wallet className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-slate-900">
                                {m.label}
                              </p>
                              <p className="text-xs text-slate-500">
                                {active ? "Ativado" : "Desativado"}
                              </p>
                            </div>
                          </div>
                          <div
                            className={cn(
                              "h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                              active
                                ? "bg-brand-600 text-white"
                                : "border-2 border-slate-300 bg-white"
                            )}
                          >
                            {active && <Check className="h-4 w-4" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      icon={<Save className="h-4 w-4" />}
                      loading={saving}
                      onClick={() => handleSave("Formas de pagamento")}
                    >
                      Salvar Pagamentos
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="usuarios" className="!mt-0">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Usuários da empresa
                      </h3>
                      <p className="text-sm text-slate-500">
                        Gerencie quem tem acesso ao sistema
                      </p>
                    </div>
                    <Button icon={<Plus className="h-4 w-4" />}>
                      Novo Usuário
                    </Button>
                  </div>
                  <Table hasData={false} colSpan={5}>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody />
                  </Table>
                  <EmptyState
                    icon={Users}
                    title="Nenhum usuário cadastrado ainda."
                    description="Clique em 'Novo Usuário' para convidar alguém da equipe."
                  />
                </div>
              </TabsContent>

              <TabsContent value="permissoes" className="!mt-0">
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Matriz de Permissões
                    </h3>
                    <p className="text-sm text-slate-500">
                      Visualize quais permissões cada papel de usuário possui
                    </p>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50/70 border-b border-slate-200">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-slate-700 uppercase text-xs tracking-wider min-w-[220px] sticky left-0 bg-slate-50/70 z-10">
                            Permissão
                          </th>
                          {ROLES.map((r) => (
                            <th
                              key={r.id}
                              className="px-4 py-3 text-center font-semibold text-slate-700 uppercase text-xs tracking-wider min-w-[120px]"
                            >
                              {r.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {PERMISSIONS_MATRIX.map((p, i) => (
                          <tr key={p.key} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 text-slate-800 font-medium sticky left-0 bg-white z-10">
                              {p.label}
                            </td>
                            {ROLES.map((r) => {
                              const ok = ROLE_PERMS[r.id][i];
                              return (
                                <td
                                  key={r.id}
                                  className="px-4 py-3 text-center"
                                >
                                  {ok ? (
                                    <span className="inline-flex h-6 w-6 rounded-full bg-green-100 text-green-600 items-center justify-center">
                                      <Check className="h-3.5 w-3.5" />
                                    </span>
                                  ) : (
                                    <span className="inline-flex h-6 w-6 rounded-full bg-slate-100 text-slate-400 items-center justify-center">
                                      <X className="h-3.5 w-3.5" />
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="aparencia" className="!mt-0">
                <div className="p-6 space-y-6 max-w-3xl">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Personalize a aparência
                    </h3>
                    <p className="text-sm text-slate-500">
                      Altere logo, cores e tema do painel
                    </p>
                  </div>
                  <div className="space-y-4">
                    <Input
                      label="URL do Logo"
                      placeholder="https://..."
                      value={appearance.logo_url}
                      onChange={(e) =>
                        setAppearance({ ...appearance, logo_url: e.target.value })
                      }
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Cor Primária
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={appearance.color_primary}
                            onChange={(e) =>
                              setAppearance({
                                ...appearance,
                                color_primary: e.target.value,
                              })
                            }
                            className="h-10 w-14 rounded-lg border border-slate-300 cursor-pointer bg-white p-1"
                          />
                          <Input
                            value={appearance.color_primary}
                            onChange={(e) =>
                              setAppearance({
                                ...appearance,
                                color_primary: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Cor Secundária
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={appearance.color_secondary}
                            onChange={(e) =>
                              setAppearance({
                                ...appearance,
                                color_secondary: e.target.value,
                              })
                            }
                            className="h-10 w-14 rounded-lg border border-slate-300 cursor-pointer bg-white p-1"
                          />
                          <Input
                            value={appearance.color_secondary}
                            onChange={(e) =>
                              setAppearance({
                                ...appearance,
                                color_secondary: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Tema da interface
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {
                            id: "light",
                            label: "Claro",
                            icon: Sun,
                            preview: [
                              "bg-white border-slate-300",
                              "bg-slate-100",
                              "bg-brand-500",
                            ],
                          },
                          {
                            id: "dark",
                            label: "Escuro",
                            icon: Moon,
                            preview: [
                              "bg-slate-900 border-slate-700",
                              "bg-slate-800",
                              "bg-brand-500",
                            ],
                          },
                        ].map((t) => {
                          const active = appearance.theme === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() =>
                                setAppearance({ ...appearance, theme: t.id })
                              }
                              className={cn(
                                "rounded-xl border-2 p-4 text-left transition-all",
                                active
                                  ? "border-brand-500 ring-2 ring-brand-200"
                                  : "border-slate-200 hover:border-slate-300"
                              )}
                            >
                              <div
                                className={cn(
                                  "rounded-lg border p-3 mb-3 grid gap-2",
                                  t.preview[0]
                                )}
                              >
                                <div className={cn("h-3 rounded", t.preview[1])} />
                                <div className={cn("h-3 w-2/3 rounded", t.preview[1])} />
                                <div
                                  className={cn("h-6 w-24 rounded mt-1", t.preview[2])}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <t.icon className="h-4 w-4 text-slate-600" />
                                  <span className="font-semibold text-sm text-slate-900">
                                    {t.label}
                                  </span>
                                </div>
                                <div
                                  className={cn(
                                    "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                                    active
                                      ? "border-brand-600 bg-brand-600 text-white"
                                      : "border-slate-300"
                                  )}
                                >
                                  {active && <Check className="h-3 w-3" />}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      icon={<Save className="h-4 w-4" />}
                      loading={saving}
                      onClick={() => handleSave("Aparência")}
                    >
                      Salvar Aparência
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

ConfiguracoesPage.getLayout = getLayout;
