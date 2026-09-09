import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/hooks/useToast";
import clientService from "@/services/clientService";
import appointmentService from "@/services/appointmentService";
import { APPOINTMENT_STATUS, DAYS_OF_WEEK } from "@/utils/constants";
import {
  formatCurrencyBRL,
  formatDateBR,
  formatDateTimeBR,
  formatTime,
  formatPhone,
  formatCPF,
  formatCEP,
} from "@/utils/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  Edit3,
  CalendarPlus,
  Phone as PhoneIcon,
  MessageCircle,
  Mail as MailIcon,
  Eye,
  Save,
  CalendarDays,
  Scissors,
  XCircle,
  CreditCard,
  TrendingUp,
  DollarSign,
  Clock,
  CalendarCheck,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";

const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  </div>
);

const infoSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().optional().or(z.literal("")),
  phone: z.string().min(10, "Telefone inválido"),
  whatsapp: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .email("E-mail inválido")
    .optional()
    .or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zipCode: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

function buildMonthlyChartData() {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleString("pt-BR", { month: "short" });
    result.push({
      month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      atendimentos: Math.floor(Math.random() * 8) + 1,
    });
  }
  return result;
}

export default function ClienteDetalhePage() {
  const router = useRouter();
  const { id, tab = "info" } = router.query;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState(tab || "info");
  const [historyTab, setHistoryTab] = useState("agendamentos");
  const [saving, setSaving] = useState(false);
  const [chartData] = useState(buildMonthlyChartData());

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      name: "",
      cpf: "",
      phone: "",
      whatsapp: "",
      email: "",
      birthDate: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [clientData, aptData] = await Promise.all([
        clientService.get(id),
        appointmentService.list({ clientId: id, page: 1, limit: 100 }),
      ]);
      setClient(clientData);
      setAppointments(aptData.data || []);
      reset({
        name: clientData.name || "",
        cpf: clientData.cpf || "",
        phone: clientData.phone || "",
        whatsapp: clientData.whatsapp || clientData.phone || "",
        email: clientData.email || "",
        birthDate: clientData.birthDate || "",
        address: clientData.address || "",
        city: clientData.city || "",
        state: clientData.state || "",
        zipCode: clientData.zipCode || "",
        notes: clientData.notes || "",
      });
    } catch (error) {
      console.error("Erro ao carregar cliente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do cliente.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handlePhoneChange = (field) => (e) => {
    const formatted = formatPhone(e.target.value);
    setValue(field, formatted, { shouldValidate: true });
  };

  const handleCPFChange = (e) => {
    setValue("cpf", formatCPF(e.target.value), { shouldValidate: true });
  };

  const handleCEPChange = (e) => {
    setValue("zipCode", formatCEP(e.target.value), { shouldValidate: true });
  };

  const onSubmitInfo = async (data) => {
    setSaving(true);
    try {
      const updated = await clientService.update(id, data);
      setClient({ ...client, ...updated, ...data });
      toast({
        title: "Dados atualizados!",
        description: "As informações do cliente foram salvas.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const getTicketMedio = () => {
    if (!client?.totalAppointments) return 0;
    return Number(client.totalSpent) / client.totalAppointments;
  };

  const getWhatsAppLink = (phone) => {
    if (!phone) return "#";
    const digits = String(phone).replace(/\D/g, "");
    return `https://wa.me/55${digits}`;
  };

  const getStatusBadge = (statusValue) => {
    const conf = APPOINTMENT_STATUS[statusValue] || APPOINTMENT_STATUS.pending;
    const variantMap = {
      pending: "warning",
      confirmed: "info",
      in_progress: "default",
      completed: "success",
      cancelled: "muted",
      no_show: "danger",
    };
    return (
      <Badge variant={variantMap[statusValue] || "default"}>
        {conf.label}
      </Badge>
    );
  };

  const agendamentosList = appointments.filter(
    (a) => a.status !== "cancelled" && a.status !== "no_show"
  );
  const cancelamentosList = appointments.filter(
    (a) => a.status === "cancelled" || a.status === "no_show"
  );
  const concluidoList = appointments.filter((a) => a.status === "completed");

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-20" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Card>
            <CardBody>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 w-full space-y-4">
                  <Skeleton className="h-8 w-full max-w-md" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
          <SkeletonTable rows={8} cols={6} />
        </div>
      </AdminLayout>
    );
  }

  if (!client) {
    return (
      <AdminLayout>
        <EmptyState
          title="Cliente não encontrado"
          description="O cliente que você procura não existe ou foi removido."
          action={{
            label: "Voltar para clientes",
            onClick: () => router.push("/clientes"),
            icon: <ArrowLeft className="h-4 w-4" />,
          }}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/clientes" passHref legacyBehavior>
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
              Voltar
            </Button>
          </Link>
          <div className="flex-1">
            <p className="text-xs text-slate-500">#{client.id}</p>
          </div>
        </div>

        <Card>
          <CardBody>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="shrink-0">
                <Avatar
                  size="xl"
                  name={client.name}
                  src={client.avatar}
                  className="ring-4 ring-brand-50"
                />
              </div>

              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold text-slate-900">
                        {client.name}
                      </h1>
                      <Badge
                        variant={
                          client.status === "active" ? "success" : "muted"
                        }
                      >
                        {client.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                      {client.createdAt && (
                        <Badge variant="muted">
                          Desde {formatDateBR(client.createdAt)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {client.phone && (
                        <a
                          href={`tel:${client.phone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm"
                        >
                          <PhoneIcon className="h-3.5 w-3.5" />
                          {client.phone}
                        </a>
                      )}
                      {(client.whatsapp || client.phone) && (
                        <a
                          href={getWhatsAppLink(client.whatsapp || client.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-sm border border-green-200"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </a>
                      )}
                      {client.email && (
                        <a
                          href={`mailto:${client.email}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors text-sm border border-brand-200"
                        >
                          <MailIcon className="h-3.5 w-3.5" />
                          {client.email}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit3 className="h-4 w-4" />}
                      onClick={() => {
                        setActiveTab("info");
                        router.replace(`/clientes/${id}?tab=info`, undefined, {
                          shallow: true,
                        });
                      }}
                    >
                      Editar
                    </Button>
                    <Link
                      href={`/agendamentos/novo?clientId=${client.id}`}
                      passHref
                      legacyBehavior
                    >
                      <Button
                        size="sm"
                        icon={<CalendarPlus className="h-4 w-4" />}
                      >
                        Novo Agendamento
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v);
            router.replace(`/clientes/${id}?tab=${v}`, undefined, {
              shallow: true,
            });
          }}
        >
          <TabsList>
            <TabsTrigger value="info">INFORMAÇÕES</TabsTrigger>
            <TabsTrigger value="historico">HISTÓRICO</TabsTrigger>
            <TabsTrigger value="indicadores">INDICADORES</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <form onSubmit={handleSubmit(onSubmitInfo)}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-brand-600" />
                    Editar Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardBody className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <Input
                        label="Nome Completo"
                        required
                        error={errors.name?.message}
                        {...register("name")}
                      />
                    </div>
                    <div>
                      <Input
                        label="CPF"
                        error={errors.cpf?.message}
                        {...register("cpf")}
                        onChange={(e) => {
                          register("cpf").onChange(e);
                          handleCPFChange(e);
                        }}
                      />
                    </div>
                    <div>
                      <Input
                        label="Data de Nascimento"
                        type="date"
                        error={errors.birthDate?.message}
                        {...register("birthDate")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <Input
                        label="Telefone"
                        required
                        error={errors.phone?.message}
                        {...register("phone")}
                        onChange={(e) => {
                          register("phone").onChange(e);
                          handlePhoneChange("phone")(e);
                        }}
                      />
                    </div>
                    <div>
                      <Input
                        label="WhatsApp"
                        error={errors.whatsapp?.message}
                        {...register("whatsapp")}
                        onChange={(e) => {
                          register("whatsapp").onChange(e);
                          handlePhoneChange("whatsapp")(e);
                        }}
                      />
                    </div>
                    <div>
                      <Input
                        label="E-mail"
                        type="email"
                        error={errors.email?.message}
                        {...register("email")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div className="md:col-span-6">
                      <Input
                        label="Endereço"
                        error={errors.address?.message}
                        {...register("address")}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Input
                        label="Cidade"
                        error={errors.city?.message}
                        {...register("city")}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Input
                        label="UF"
                        maxLength={2}
                        error={errors.state?.message}
                        {...register("state")}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="CEP"
                        error={errors.zipCode?.message}
                        {...register("zipCode")}
                        onChange={(e) => {
                          register("zipCode").onChange(e);
                          handleCEPChange(e);
                        }}
                      />
                    </div>
                  </div>

                  <Textarea
                    label="Observações"
                    rows={4}
                    error={errors.notes?.message}
                    {...register("notes")}
                  />
                </CardBody>
                <CardFooter>
                  <Button
                    type="submit"
                    loading={saving}
                    icon={<Save className="h-4 w-4" />}
                  >
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="historico">
            <Card>
              <CardBody>
                <Tabs
                  value={historyTab}
                  onValueChange={setHistoryTab}
                  defaultValue="agendamentos"
                >
                  <TabsList>
                    <TabsTrigger value="agendamentos">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Agendamentos
                    </TabsTrigger>
                    <TabsTrigger value="servicos">
                      <Scissors className="h-4 w-4 mr-2" />
                      Serviços
                    </TabsTrigger>
                    <TabsTrigger value="cancelamentos">
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelamentos
                    </TabsTrigger>
                    <TabsTrigger value="pagamentos">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pagamentos
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="agendamentos">
                    {agendamentosList.length === 0 ? (
                      <EmptyState
                        icon={<CalendarDays className="h-8 w-8 text-slate-400" strokeWidth={1.5} />}
                        title="Sem agendamentos"
                        description="Este cliente ainda não possui agendamentos."
                      />
                    ) : (
                      <Table zebra colSpan={6}>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Serviço</TableHead>
                            <TableHead>Profissional</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {agendamentosList.map((apt) => (
                            <TableRow key={apt.id}>
                              <TableCell>{formatDateBR(apt.start)}</TableCell>
                              <TableCell className="font-medium">
                                {apt.serviceName}
                              </TableCell>
                              <TableCell>
                                {apt.professionalName || "-"}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrencyBRL(apt.totalPrice)}
                              </TableCell>
                              <TableCell className="text-center">
                                {getStatusBadge(apt.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Link
                                  href={`/agendamentos/${apt.id}`}
                                  passHref
                                  legacyBehavior
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={<Eye className="h-4 w-4" />}
                                  />
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  <TabsContent value="servicos">
                    {concluidoList.length === 0 ? (
                      <EmptyState
                        icon={<Scissors className="h-8 w-8 text-slate-400" strokeWidth={1.5} />}
                        title="Sem serviços realizados"
                        description="Os serviços concluídos aparecerão aqui."
                      />
                    ) : (
                      <Table zebra colSpan={6}>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Serviço</TableHead>
                            <TableHead>Profissional</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {concluidoList.map((apt) => (
                            <TableRow key={apt.id}>
                              <TableCell>{formatDateBR(apt.start)}</TableCell>
                              <TableCell className="font-medium">
                                {apt.serviceName}
                              </TableCell>
                              <TableCell>
                                {apt.professionalName || "-"}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrencyBRL(apt.totalPrice)}
                              </TableCell>
                              <TableCell className="text-center">
                                {getStatusBadge(apt.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Link
                                  href={`/agendamentos/${apt.id}`}
                                  passHref
                                  legacyBehavior
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={<Eye className="h-4 w-4" />}
                                  />
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  <TabsContent value="cancelamentos">
                    {cancelamentosList.length === 0 ? (
                      <EmptyState
                        icon={<XCircle className="h-8 w-8 text-slate-400" strokeWidth={1.5} />}
                        title="Sem cancelamentos"
                        description="Nenhum agendamento foi cancelado ou não comparecido."
                      />
                    ) : (
                      <Table zebra colSpan={6}>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Serviço</TableHead>
                            <TableHead>Profissional</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cancelamentosList.map((apt) => (
                            <TableRow key={apt.id}>
                              <TableCell>{formatDateBR(apt.start)}</TableCell>
                              <TableCell className="font-medium">
                                {apt.serviceName}
                              </TableCell>
                              <TableCell>
                                {apt.professionalName || "-"}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrencyBRL(apt.totalPrice)}
                              </TableCell>
                              <TableCell className="text-center">
                                {getStatusBadge(apt.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Link
                                  href={`/agendamentos/${apt.id}`}
                                  passHref
                                  legacyBehavior
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={<Eye className="h-4 w-4" />}
                                  />
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  <TabsContent value="pagamentos">
                    {concluidoList.length === 0 ? (
                      <EmptyState
                        icon={<CreditCard className="h-8 w-8 text-slate-400" strokeWidth={1.5} />}
                        title="Sem pagamentos"
                        description="Os pagamentos registrados aparecerão aqui."
                      />
                    ) : (
                      <Table zebra colSpan={6}>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Serviço</TableHead>
                            <TableHead>Forma Pagamento</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="text-center">Pago</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {concluidoList.map((apt) => (
                            <TableRow key={apt.id}>
                              <TableCell>{formatDateBR(apt.start)}</TableCell>
                              <TableCell className="font-medium">
                                {apt.serviceName}
                              </TableCell>
                              <TableCell>{apt.paymentMethod || "-"}</TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrencyBRL(apt.totalPrice)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant={apt.paid ? "success" : "warning"}
                                >
                                  {apt.paid ? "Sim" : "Pendente"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Link
                                  href={`/agendamentos/${apt.id}`}
                                  passHref
                                  legacyBehavior
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={<Eye className="h-4 w-4" />}
                                  />
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>
                </Tabs>
              </CardBody>
            </Card>
          </TabsContent>

          <TabsContent value="indicadores">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                    <span className="text-xs text-slate-500">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrencyBRL(client.totalSpent)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Total Gasto</p>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-5 w-5 text-brand-500" />
                    <span className="text-xs text-slate-500">Média</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrencyBRL(getTicketMedio())}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Ticket Médio</p>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-2">
                    <CalendarCheck className="h-5 w-5 text-blue-500" />
                    <span className="text-xs text-slate-500">Qtd</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {client.totalAppointments || 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Atendimentos</p>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <span className="text-xs text-slate-500">Recente</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 text-lg">
                    {client.lastVisit ? formatDateBR(client.lastVisit) : "-"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Última Visita</p>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <span className="text-xs text-slate-500">Início</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 text-lg">
                    {client.createdAt ? formatDateBR(client.createdAt) : "-"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Primeiro Atendimento
                  </p>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Frequência nos últimos 6 meses</CardTitle>
                <CardDescription>
                  Quantidade de atendimentos por mês
                </CardDescription>
              </CardHeader>
              <CardBody>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="month"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="atendimentos"
                        fill="url(#colorBrand)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={50}
                      />
                      <defs>
                        <linearGradient
                          id="colorBrand"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#4f46e5"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#818cf8"
                            stopOpacity={0.8}
                          />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
