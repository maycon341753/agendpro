import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Plus,
  Calendar,
  Clock,
  User,
  Scissors,
  LogIn,
  RefreshCw,
  XCircle,
  History,
  CreditCard,
  UserCog,
  Mail,
  Phone,
  MessageCircle,
  Lock,
  ChevronRight,
  Search,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import DialogConfirm from "@/components/ui/DialogConfirm";
import Alert from "@/components/ui/Alert";
import Textarea from "@/components/ui/Textarea";
import { ServiceCard } from "@/components/public";
import { useAuth } from "@/contexts/AuthContext";
import appointmentService from "@/services/appointmentService";
import notificationService from "@/services/notificationService";
import {
  formatCurrencyBRL,
  formatDateBR,
  formatDateTimeBR,
  formatPhone,
  formatTime,
} from "@/utils/format";
import { APPOINTMENT_STATUS } from "@/utils/constants";
import { cn } from "@/utils/cn";

const MOCK_UPCOMING = [
  {
    id: 101,
    serviceId: 1,
    serviceName: "Corte Feminino",
    professionalName: "Ana Silva",
    start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
    status: "confirmed",
    totalPrice: 100,
    duration: 60,
    companySlug: "studio-bella",
    companyName: "Studio Bella",
    color: "#ec4899",
  },
  {
    id: 102,
    serviceId: 5,
    serviceName: "Manicure",
    professionalName: "Maria Santos",
    start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    status: "pending",
    totalPrice: 45,
    duration: 45,
    companySlug: "studio-bella",
    companyName: "Studio Bella",
    color: "#10b981",
  },
  {
    id: 103,
    serviceId: 8,
    serviceName: "Limpeza de Pele",
    professionalName: "Juliana Costa",
    start: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
    status: "confirmed",
    totalPrice: 150,
    duration: 75,
    companySlug: "studio-bella",
    companyName: "Studio Bella",
    color: "#3b82f6",
  },
];

const MOCK_HISTORY = [
  {
    id: 90,
    serviceId: 1,
    serviceName: "Corte Feminino",
    professionalName: "Ana Silva",
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    totalPrice: 100,
    companySlug: "studio-bella",
    companyName: "Studio Bella",
    color: "#ec4899",
  },
  {
    id: 85,
    serviceId: 3,
    serviceName: "Coloração",
    professionalName: "Ana Silva",
    start: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    totalPrice: 180,
    companySlug: "studio-bella",
    companyName: "Studio Bella",
    color: "#a855f7",
  },
  {
    id: 80,
    serviceId: 6,
    serviceName: "Pedicure",
    professionalName: "Maria Santos",
    start: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    status: "cancelled",
    totalPrice: 60,
    companySlug: "studio-bella",
    companyName: "Studio Bella",
    color: "#14b8a6",
  },
  {
    id: 75,
    serviceId: 2,
    serviceName: "Escova Progressiva",
    professionalName: "Ana Silva",
    start: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    totalPrice: 250,
    companySlug: "studio-bella",
    companyName: "Studio Bella",
    color: "#f472b6",
  },
  {
    id: 70,
    serviceId: 9,
    serviceName: "Hidratação Facial",
    professionalName: "Juliana Costa",
    start: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    totalPrice: 130,
    companySlug: "studio-bella",
    companyName: "Studio Bella",
    color: "#6366f1",
  },
];

const MOCK_TOP_SERVICES = [
  {
    id: 1,
    name: "Corte Feminino",
    category: "Cabelo",
    duration: 60,
    price: 100,
    color: "#ec4899",
    count: 5,
  },
  {
    id: 5,
    name: "Manicure",
    category: "Unhas",
    duration: 45,
    price: 45,
    color: "#10b981",
    count: 4,
  },
  {
    id: 3,
    name: "Coloração",
    category: "Cabelo",
    duration: 90,
    price: 180,
    color: "#a855f7",
    count: 3,
  },
];

const DEFAULT_COMPANY_SLUG = "studio-bella";

export default function MeusAgendamentosPage() {
  const router = useRouter();
  const { user, profile, loading, updateProfile, updatePassword } = useAuth();

  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [guestData, setGuestData] = React.useState({ email: "", phone: "" });
  const [guestErrors, setGuestErrors] = React.useState({});
  const [guestLoading, setGuestLoading] = React.useState(false);

  const [cancelDialog, setCancelDialog] = React.useState({
    open: false,
    appointment: null,
    loading: false,
  });

  const [tab, setTab] = React.useState("upcoming");
  const [historyPage, setHistoryPage] = React.useState(1);
  const HISTORY_PAGE_SIZE = 4;

  const [profileForm, setProfileForm] = React.useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = React.useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [profileErrors, setProfileErrors] = React.useState({});
  const [passwordErrors, setPasswordErrors] = React.useState({});
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [passwordSaving, setPasswordSaving] = React.useState(false);

  React.useEffect(() => {
    if (!loading) {
      setIsAuthenticated(!!user);
      if (profile) {
        setProfileForm({
          name: profile.full_name || profile.name || "",
          phone: profile.phone || "",
          whatsapp: profile.whatsapp || "",
          email: user?.email || profile.email || "",
        });
      }
    }
  }, [loading, user, profile]);

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!guestData.email.trim() && !guestData.phone.trim()) {
      errors.general = "Informe seu e-mail ou telefone para consultar.";
    }
    if (guestData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestData.email)) {
      errors.email = "E-mail inválido";
    }
    if (Object.keys(errors).length > 0) {
      setGuestErrors(errors);
      return;
    }
    setGuestLoading(true);
    setGuestErrors({});
    await new Promise((r) => setTimeout(r, 600));
    setIsAuthenticated(true);
    setGuestLoading(false);
    if (guestData.email) {
      setProfileForm((p) => ({ ...p, email: guestData.email }));
    }
    if (guestData.phone) {
      setProfileForm((p) => ({ ...p, phone: guestData.phone }));
    }
  };

  const handleReschedule = (apt) => {
    router.push(`/agendar/${apt.companySlug || DEFAULT_COMPANY_SLUG}`);
  };

  const handleCancelRequest = (apt) => {
    setCancelDialog({ open: true, appointment: apt, loading: false });
  };

  const handleConfirmCancel = async () => {
    if (!cancelDialog.appointment) return;
    setCancelDialog((c) => ({ ...c, loading: true }));
    try {
      await appointmentService.update(cancelDialog.appointment.id, {
        status: "cancelled",
      });
      await notificationService.dispatchNotification(
        "appointment_cancelled",
        {
          clientName: profile?.full_name || "Cliente",
          date: formatDateTimeBR(cancelDialog.appointment.start),
        },
        1
      );
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Erro ao cancelar. Tente novamente.");
    } finally {
      setCancelDialog((c) => ({ ...c, loading: false, open: false }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!profileForm.name.trim()) errors.name = "Nome é obrigatório";
    if (!profileForm.email.trim()) errors.email = "E-mail é obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email))
      errors.email = "E-mail inválido";
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }
    setProfileSaving(true);
    setProfileErrors({});
    try {
      if (user && updateProfile) {
        await updateProfile({
          full_name: profileForm.name,
          phone: profileForm.phone,
          whatsapp: profileForm.whatsapp,
        });
      }
      await new Promise((r) => setTimeout(r, 400));
      alert("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar perfil.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordForm.current) errors.current = "Senha atual é obrigatória";
    if (!passwordForm.new) errors.new = "Nova senha é obrigatória";
    else if (passwordForm.new.length < 6)
      errors.new = "Nova senha deve ter pelo menos 6 caracteres";
    if (passwordForm.new !== passwordForm.confirm)
      errors.confirm = "Senhas não coincidem";
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    setPasswordSaving(true);
    setPasswordErrors({});
    try {
      if (updatePassword) {
        await updatePassword(passwordForm.new);
      }
      await new Promise((r) => setTimeout(r, 400));
      alert("Senha alterada com sucesso!");
      setPasswordForm({ current: "", new: "", confirm: "" });
    } catch (err) {
      console.error(err);
      alert("Erro ao alterar senha. Verifique a senha atual.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const totalSpent = React.useMemo(() => {
    return MOCK_HISTORY.filter((h) => h.status === "completed").reduce(
      (acc, h) => acc + (h.totalPrice || 0),
      0
    );
  }, []);

  const completedCount = MOCK_HISTORY.filter((h) => h.status === "completed").length;
  const pagedHistory = MOCK_HISTORY.slice(
    (historyPage - 1) * HISTORY_PAGE_SIZE,
    historyPage * HISTORY_PAGE_SIZE
  );
  const totalHistoryPages = Math.ceil(MOCK_HISTORY.length / HISTORY_PAGE_SIZE);

  const StatusBadge = ({ status }) => {
    const cfg = APPOINTMENT_STATUS[status] || APPOINTMENT_STATUS.pending;
    const variantMap = {
      pending: "warning",
      confirmed: "info",
      in_progress: "info",
      completed: "success",
      cancelled: "danger",
      no_show: "muted",
    };
    return (
      <Badge variant={variantMap[status] || "default"}>
        {cfg.label}
      </Badge>
    );
  };

  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Head>
          <title>Meus Agendamentos</title>
        </Head>
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-brand-100 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Meus agendamentos
            </h1>
            <p className="text-slate-500">
              Acesse seus agendamentos ou faça login na sua conta
            </p>
          </div>

          <Card>
            <CardBody className="space-y-6">
              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-sm font-medium text-slate-900 mb-3">
                    Consultar sem conta
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    Informe seus dados para visualizar seus agendamentos
                  </p>
                  {guestErrors.general && (
                    <Alert variant="warning" dismissible={false} className="mb-4">
                      {guestErrors.general}
                    </Alert>
                  )}
                  <div className="space-y-3">
                    <Input
                      label="E-mail"
                      type="email"
                      leftIcon={<Mail className="h-4 w-4" />}
                      placeholder="seu@email.com"
                      value={guestData.email}
                      onChange={(e) => {
                        setGuestData({ ...guestData, email: e.target.value });
                        if (guestErrors.email)
                          setGuestErrors({ ...guestErrors, email: "" });
                      }}
                      error={guestErrors.email}
                    />
                    <div className="text-center text-xs text-slate-400">OU</div>
                    <Input
                      label="Telefone"
                      leftIcon={<Phone className="h-4 w-4" />}
                      placeholder="(00) 00000-0000"
                      value={guestData.phone}
                      onChange={(e) =>
                        setGuestData({ ...guestData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  icon={<Search className="h-4 w-4" />}
                  loading={guestLoading}
                >
                  Consultar agendamentos
                </Button>
              </form>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs text-slate-500">
                    ou
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link href="/login">
                  <Button variant="outline" className="w-full" icon={<LogIn className="h-4 w-4" />}>
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button variant="outline" className="w-full" icon={<UserCog className="h-4 w-4" />}>
                    Cadastrar
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Head>
        <title>Meus Agendamentos</title>
      </Head>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              name={profile?.full_name || profileForm.name || "Cliente"}
              size="md"
              className="shrink-0 bg-brand-100 text-brand-600"
            />
            <div className="min-w-0">
              <h1 className="font-semibold text-slate-900 truncate">
                Olá, {(profile?.full_name || profileForm.name || "Cliente").split(" ")[0]}!
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {profileForm.email || user?.email || "Consulta de agendamentos"}
              </p>
            </div>
          </div>
          {user && (
            <Link href="/perfil">
              <Button variant="ghost" size="sm">
                <UserCog className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Perfil</span>
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <Card className="mb-6 shadow-sm overflow-hidden">
          <div
            className="h-2 w-full"
            style={{
              background:
                "linear-gradient(90deg, #ec4899 0%, #f59e0b 50%, #10b981 100%)",
            }}
          />
          <CardBody>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <p className="text-sm font-medium text-slate-900">
                    Agendar novamente
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  Seus serviços mais frequentes
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 sm:max-w-2xl">
                {MOCK_TOP_SERVICES.map((svc) => (
                  <Link
                    key={svc.id}
                    href={`/agendar/${DEFAULT_COMPANY_SLUG}`}
                    className="block group"
                  >
                    <div
                      className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-3 cursor-pointer"
                    >
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${svc.color}15`, color: svc.color }}
                      >
                        <Scissors className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {svc.name}
                        </p>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-xs text-slate-500">
                            {svc.count}x
                          </span>
                          <span
                            className="text-xs font-bold"
                            style={{ color: svc.color }}
                          >
                            {formatCurrencyBRL(svc.price)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="upcoming">
              <Calendar className="h-4 w-4 mr-1.5" />
              Próximos
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-1.5" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="services">
              <CreditCard className="h-4 w-4 mr-1.5" />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="profile">
              <UserCog className="h-4 w-4 mr-1.5" />
              Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {MOCK_UPCOMING.length === 0 ? (
              <Card>
                <CardBody className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Nenhum agendamento futuro
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Agende seu primeiro atendimento
                  </p>
                  <Link href={`/agendar/${DEFAULT_COMPANY_SLUG}`}>
                    <Button icon={<Plus className="h-4 w-4" />}>
                      Agendar agora
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-4">
                {MOCK_UPCOMING.map((apt) => {
                  const sDate = new Date(apt.start);
                  return (
                    <Card key={apt.id}>
                      <CardBody>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div
                            className="h-20 w-full sm:w-20 rounded-xl flex flex-col items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `${apt.color}15`,
                              color: apt.color,
                            }}
                          >
                            <p className="text-xs font-medium uppercase">
                              {sDate.toLocaleDateString("pt-BR", { month: "short" })}
                            </p>
                            <p className="text-2xl font-bold leading-none">
                              {sDate.getDate()}
                            </p>
                            <p className="text-xs font-medium mt-0.5">
                              {formatTime(apt.start)}
                            </p>
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="min-w-0">
                                <h3 className="font-semibold text-slate-900 truncate">
                                  {apt.serviceName}
                                </h3>
                                <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                                  <User className="h-3.5 w-3.5 shrink-0" />
                                  {apt.professionalName}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {apt.companyName}
                                </p>
                              </div>
                              <StatusBadge status={apt.status} />
                            </div>
                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                              <div className="flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-1 text-slate-500">
                                  <Clock className="h-3.5 w-3.5" />
                                  {apt.duration} min
                                </span>
                                <span
                                  className="font-bold"
                                  style={{ color: apt.color }}
                                >
                                  {formatCurrencyBRL(apt.totalPrice)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  icon={<RefreshCw className="h-3.5 w-3.5" />}
                                  onClick={() => handleReschedule(apt)}
                                >
                                  <span className="hidden sm:inline">Reagendar</span>
                                  <span className="sm:hidden">Reag.</span>
                                </Button>
                                {(apt.status === "confirmed" || apt.status === "pending") && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    icon={<XCircle className="h-3.5 w-3.5 text-red-500" />}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => handleCancelRequest(apt)}
                                  >
                                    <span className="hidden sm:inline">Cancelar</span>
                                    <span className="sm:hidden">Canc.</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle>Histórico</CardTitle>
                    <CardDescription>
                      {MOCK_HISTORY.length} atendimento(s) realizados
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Total gasto</p>
                    <p className="text-lg font-bold text-slate-900">
                      {formatCurrencyBRL(totalSpent)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="divide-y divide-slate-100 -mx-6">
                  {pagedHistory.map((apt) => (
                    <div
                      key={apt.id}
                      className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div
                        className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${apt.color}15`,
                          color: apt.color,
                        }}
                      >
                        <Scissors className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-slate-900 truncate">
                            {apt.serviceName}
                          </p>
                          <StatusBadge status={apt.status} />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {apt.professionalName} • {formatDateBR(apt.start)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className="font-semibold"
                          style={{ color: apt.color }}
                        >
                          {formatCurrencyBRL(apt.totalPrice)}
                        </p>
                        <Link
                          href={`/agendar/${apt.companySlug || DEFAULT_COMPANY_SLUG}`}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium mt-1 inline-flex items-center gap-0.5"
                        >
                          Repetir <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {totalHistoryPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6 mt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={historyPage === 1}
                      onClick={() => setHistoryPage((p) => p - 1)}
                    >
                      Anterior
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map(
                        (p) => (
                          <button
                            key={p}
                            onClick={() => setHistoryPage(p)}
                            className={cn(
                              "h-8 w-8 rounded-lg text-sm font-medium transition-colors",
                              p === historyPage
                                ? "bg-brand-600 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                            )}
                          >
                            {p}
                          </button>
                        )
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={historyPage === totalHistoryPages}
                      onClick={() => setHistoryPage((p) => p + 1)}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardBody>
                  <p className="text-sm text-slate-500">Total gasto</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {formatCurrencyBRL(totalSpent)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    em {completedCount} atendimentos
                  </p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-sm text-slate-500">Serviços realizados</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {completedCount}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {MOCK_TOP_SERVICES.length} tipos diferentes
                  </p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-sm text-slate-500">Ticket médio</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {formatCurrencyBRL(completedCount > 0 ? totalSpent / completedCount : 0)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">por atendimento</p>
                </CardBody>
              </Card>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <h3 className="font-semibold text-slate-900">
                Serviços mais utilizados
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_TOP_SERVICES.map((svc) => (
                <ServiceCard
                  key={svc.id}
                  service={svc}
                  selected={false}
                  onSelect={() =>
                    router.push(`/agendar/${DEFAULT_COMPANY_SLUG}`)
                  }
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meus dados</CardTitle>
                  <CardDescription>
                    Atualize suas informações de contato
                  </CardDescription>
                </CardHeader>
                <CardBody>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <Input
                      label="Nome completo"
                      required
                      leftIcon={<User className="h-4 w-4" />}
                      value={profileForm.name}
                      onChange={(e) => {
                        setProfileForm({ ...profileForm, name: e.target.value });
                        if (profileErrors.name)
                          setProfileErrors({ ...profileErrors, name: "" });
                      }}
                      error={profileErrors.name}
                    />
                    <Input
                      label="E-mail"
                      required
                      type="email"
                      leftIcon={<Mail className="h-4 w-4" />}
                      value={profileForm.email}
                      onChange={(e) => {
                        setProfileForm({ ...profileForm, email: e.target.value });
                        if (profileErrors.email)
                          setProfileErrors({ ...profileErrors, email: "" });
                      }}
                      error={profileErrors.email}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Telefone"
                        leftIcon={<Phone className="h-4 w-4" />}
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, phone: e.target.value })
                        }
                      />
                      <Input
                        label="WhatsApp"
                        leftIcon={<MessageCircle className="h-4 w-4 text-green-600" />}
                        value={profileForm.whatsapp}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, whatsapp: e.target.value })
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full sm:w-auto"
                      loading={profileSaving}
                    >
                      Salvar alterações
                    </Button>
                  </form>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alterar senha</CardTitle>
                  <CardDescription>
                    Mantenha sua conta segura
                  </CardDescription>
                </CardHeader>
                <CardBody>
                  {!user ? (
                    <Alert variant="info" dismissible={false}>
                      Para alterar sua senha, faça login com uma conta registrada.
                    </Alert>
                  ) : (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <Input
                        label="Senha atual"
                        type="password"
                        required
                        leftIcon={<Lock className="h-4 w-4" />}
                        value={passwordForm.current}
                        onChange={(e) => {
                          setPasswordForm({ ...passwordForm, current: e.target.value });
                          if (passwordErrors.current)
                            setPasswordErrors({ ...passwordErrors, current: "" });
                        }}
                        error={passwordErrors.current}
                      />
                      <Input
                        label="Nova senha"
                        type="password"
                        required
                        leftIcon={<Lock className="h-4 w-4" />}
                        helperText="Mínimo 6 caracteres"
                        value={passwordForm.new}
                        onChange={(e) => {
                          setPasswordForm({ ...passwordForm, new: e.target.value });
                          if (passwordErrors.new)
                            setPasswordErrors({ ...passwordErrors, new: "" });
                        }}
                        error={passwordErrors.new}
                      />
                      <Input
                        label="Confirmar nova senha"
                        type="password"
                        required
                        leftIcon={<Lock className="h-4 w-4" />}
                        value={passwordForm.confirm}
                        onChange={(e) => {
                          setPasswordForm({ ...passwordForm, confirm: e.target.value });
                          if (passwordErrors.confirm)
                            setPasswordErrors({ ...passwordErrors, confirm: "" });
                        }}
                        error={passwordErrors.confirm}
                      />
                      <Button
                        type="submit"
                        className="w-full sm:w-auto"
                        loading={passwordSaving}
                      >
                        Alterar senha
                      </Button>
                    </form>
                  )}
                </CardBody>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <div className="fixed bottom-5 right-5 z-40">
        <Link href={`/agendar/${DEFAULT_COMPANY_SLUG}`}>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-xl hover:shadow-2xl transition-all p-0"
            icon={<Plus className="h-6 w-6" />}
            aria-label="Novo agendamento"
          />
        </Link>
      </div>

      <DialogConfirm
        open={cancelDialog.open}
        onOpenChange={(open) =>
          !cancelDialog.loading && setCancelDialog({ ...cancelDialog, open })
        }
        title="Cancelar agendamento?"
        description={
          cancelDialog.appointment
            ? `Tem certeza que deseja cancelar o agendamento de ${cancelDialog.appointment.serviceName} com ${cancelDialog.appointment.professionalName} em ${formatDateTimeBR(cancelDialog.appointment.start)}?`
            : ""
        }
        confirmText="Sim, cancelar"
        cancelText="Manter agendamento"
        variant="danger"
        loading={cancelDialog.loading}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
