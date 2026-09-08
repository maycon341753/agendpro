import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Scissors,
  Clock,
  Calendar,
  User,
  MapPin,
  CheckCircle2,
  CalendarPlus,
  Plus,
  ShuffleUsers,
  Mail,
  FileText,
  Lock,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Alert from "@/components/ui/Alert";
import { StepsProgress, ServiceCard, PublicCalendar, TimeSlot } from "@/components/public";
import { getBySlug } from "@/services/companyService";
import { getAvailableSlotsAPI } from "@/services/availabilityService";
import appointmentService from "@/services/appointmentService";
import notificationService from "@/services/notificationService";
import { formatCurrencyBRL, formatDateBR, formatPhone } from "@/utils/format";
import { DAYS_OF_WEEK } from "@/utils/constants";
import { cn } from "@/utils/cn";

const CATEGORIES = ["Todas", "Cabelo", "Unhas", "Estética"];

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const company = await getBySlug(slug);

  if (!company) {
    return { notFound: true };
  }

  return {
    props: {
      company: JSON.parse(JSON.stringify(company)),
    },
  };
}

export default function AgendarPage({ company }) {
  const router = useRouter();
  const brandColor = company.colorPrimary || "#ec4899";

  const [currentStep, setCurrentStep] = React.useState(1);
  const [fadeKey, setFadeKey] = React.useState(0);

  const [selectedService, setSelectedService] = React.useState(null);
  const [selectedProfessional, setSelectedProfessional] = React.useState(null);
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [selectedTime, setSelectedTime] = React.useState(null);
  const [availableSlots, setAvailableSlots] = React.useState([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);

  const [categoryFilter, setCategoryFilter] = React.useState("Todas");

  const [clientData, setClientData] = React.useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = React.useState({});

  const [createAccount, setCreateAccount] = React.useState(false);
  const [accountData, setAccountData] = React.useState({
    password: "",
    confirmPassword: "",
  });

  const [confirming, setConfirming] = React.useState(false);
  const [successData, setSuccessData] = React.useState(null);

  const styleVars = {
    "--brand-color": brandColor,
  };

  const filteredServices = React.useMemo(() => {
    if (categoryFilter === "Todas") return company.services || [];
    return (company.services || []).filter((s) => s.category === categoryFilter);
  }, [company.services, categoryFilter]);

  const availableProfessionals = React.useMemo(() => {
    if (!selectedService) return [];
    return (company.professionals || []).filter((p) =>
      p.services?.includes(selectedService.id)
    );
  }, [company.professionals, selectedService]);

  React.useEffect(() => {
    if (!selectedDate || !selectedService) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const slots = await getAvailableSlotsAPI(company.id, {
          serviceId: selectedService.id,
          professionalId: selectedProfessional?.id || null,
          date: selectedDate.toISOString(),
          interval: 30,
        });
        setAvailableSlots(slots);
      } catch (err) {
        console.error("Erro ao buscar horários:", err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedService, selectedProfessional, company.id]);

  const formatFullDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const dayOfWeek = DAYS_OF_WEEK[d.getDay()].label;
    return `${dayOfWeek}, ${formatDateBR(d)}`;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    setCurrentStep((s) => s + 1);
    setFadeKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (currentStep === 1) {
      router.push(`/empresa/${company.slug}`);
      return;
    }
    setCurrentStep((s) => s - 1);
    setFadeKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!selectedService) {
          alert("Selecione um serviço para continuar.");
          return false;
        }
        return true;
      case 2:
        return true;
      case 3:
        if (!selectedDate) {
          alert("Selecione uma data para continuar.");
          return false;
        }
        return true;
      case 4:
        if (!selectedTime) {
          alert("Selecione um horário para continuar.");
          return false;
        }
        return true;
      case 5:
        return validateClientForm();
      default:
        return true;
    }
  };

  const validateClientForm = () => {
    const errors = {};

    if (!clientData.name.trim()) {
      errors.name = "Nome é obrigatório";
    }
    if (!clientData.phone.trim()) {
      errors.phone = "Telefone é obrigatório";
    }
    if (!clientData.email.trim()) {
      errors.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
      errors.email = "E-mail inválido";
    }

    if (createAccount) {
      if (!accountData.password) {
        errors.password = "Senha é obrigatória";
      } else if (accountData.password.length < 6) {
        errors.password = "Senha deve ter pelo menos 6 caracteres";
      }
      if (!accountData.confirmPassword) {
        errors.confirmPassword = "Confirme a senha";
      } else if (accountData.password !== accountData.confirmPassword) {
        errors.confirmPassword = "Senhas não coincidem";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateClientForm()) {
      setCurrentStep(5);
      setFadeKey((k) => k + 1);
      return;
    }

    setConfirming(true);
    try {
      const startDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + (selectedService?.duration || 60));

      const appointment = await appointmentService.create({
        companyId: company.id,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        professionalId: selectedProfessional?.id || null,
        professionalName: selectedProfessional?.name || "Qualquer profissional",
        clientName: clientData.name,
        clientPhone: clientData.phone,
        clientWhatsapp: clientData.whatsapp,
        clientEmail: clientData.email,
        notes: clientData.notes,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        status: "confirmed",
        totalPrice: selectedService.price,
      });

      await notificationService.dispatchNotification(
        "appointment_created",
        {
          clientId: null,
          clientName: clientData.name,
          date: `${formatFullDate(selectedDate)} às ${selectedTime}`,
          professional: selectedProfessional?.name || "Qualquer profissional",
          service: selectedService.name,
        },
        company.id
      );

      const protocol = String(appointment.id).padStart(8, "0");
      setSuccessData({
        protocol,
        appointment,
      });
    } catch (err) {
      console.error("Erro ao confirmar agendamento:", err);
      alert("Ocorreu um erro ao confirmar. Tente novamente.");
    } finally {
      setConfirming(false);
    }
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedProfessional(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setClientData({ name: "", phone: "", whatsapp: "", email: "", notes: "" });
    setCreateAccount(false);
    setAccountData({ password: "", confirmPassword: "" });
    setFormErrors({});
    setSuccessData(null);
    setFadeKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownloadICS = () => {
    const startDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(":").map(Number);
    startDateTime.setHours(hours, minutes, 0, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + (selectedService?.duration || 60));

    const toICSDate = (d) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Agendamento//PT-BR//",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@${company.slug}`,
      `DTSTAMP:${toICSDate(new Date())}`,
      `DTSTART:${toICSDate(startDateTime)}`,
      `DTEND:${toICSDate(endDateTime)}`,
      `SUMMARY:${selectedService?.name || "Agendamento"} - ${company.name}`,
      `DESCRIPTION:${clientData.notes || "Agendamento confirmado"}`,
      `LOCATION:${company.address || ""}, ${company.city || ""}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    if (typeof window !== "undefined") {
      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `agendamento-${successData?.protocol || "evento"}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (successData) {
    return (
      <div style={styleVars} className="min-h-screen bg-slate-50">
        <Head>
          <title>Agendamento Confirmado - {company.name}</title>
        </Head>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="animate-fade-in text-center">
            <div
              className="mx-auto h-24 w-24 rounded-full flex items-center justify-center mb-6 shadow-lg"
              style={{ backgroundColor: "#10b981" }}
            >
              <CheckCircle2 className="h-14 w-14 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Agendamento confirmado!
            </h1>
            <p className="text-slate-600 mb-6">
              Enviamos os detalhes para o seu WhatsApp e e-mail.
            </p>

            <Card className="mb-8 text-left">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Protocolo</span>
                  <span className="font-mono font-bold text-slate-900">
                    #{successData.protocol}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
                  >
                    <Scissors className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{selectedService?.name}</p>
                    <p className="text-sm text-slate-500">
                      {selectedService?.duration} min • {formatCurrencyBRL(selectedService?.price)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
                  >
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {selectedProfessional?.name || "Qualquer profissional disponível"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
                  >
                    <Calendar className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {formatFullDate(selectedDate)}
                    </p>
                    <p className="text-sm text-slate-500">às {selectedTime}</p>
                  </div>
                </div>
                {company.address && (
                  <div className="flex items-start gap-3">
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
                    >
                      <MapPin className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-slate-900">{company.address}</p>
                      <p className="text-sm text-slate-500">
                        {company.city} - {company.state}
                      </p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                icon={<CalendarPlus className="h-5 w-5" />}
                onClick={handleDownloadICS}
                className="w-full"
              >
                Adicionar à minha agenda
              </Button>
              <Button
                size="lg"
                icon={<Plus className="h-5 w-5" />}
                onClick={resetFlow}
                className="w-full"
                style={{ backgroundColor: brandColor }}
              >
                Agendar outro atendimento
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styleVars} className="min-h-screen bg-slate-50">
      <Head>
        <title>Agendar - {company.name}</title>
      </Head>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 -ml-2 shrink-0"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar
              src={company.logo}
              name={company.name}
              size="md"
              className="shrink-0"
              style={company.logo ? {} : { backgroundColor: `${brandColor}20`, color: brandColor }}
            />
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-slate-900 truncate">{company.name}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {company.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span className="hidden sm:inline">{formatPhone(company.phone)}</span>
                  </span>
                )}
                {company.whatsapp && (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {company.whatsapp && (
            <Link
              href={`https://wa.me/${String(company.whatsapp).replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button variant="ghost" size="sm" icon={<MessageCircle className="h-4 w-4 text-green-600" />}>
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <StepsProgress currentStep={currentStep} />
        </div>

        <div key={fadeKey} className="animate-fade-in">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                  Selecione um serviço
                </h2>
                <p className="text-slate-500 text-sm sm:text-base">
                  Escolha o que você deseja agendar
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      "h-9 px-4 rounded-full text-sm font-medium transition-all duration-200 border",
                      categoryFilter === cat
                        ? "text-white border-transparent shadow-sm"
                        : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
                    )}
                    style={categoryFilter === cat ? { backgroundColor: brandColor } : {}}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    selected={selectedService?.id === service.id}
                    onSelect={setSelectedService}
                  />
                ))}
              </div>

              {filteredServices.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  Nenhum serviço encontrado nesta categoria.
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                  Escolha o profissional
                </h2>
                <p className="text-slate-500 text-sm sm:text-base">
                  Serviço selecionado:{" "}
                  <span className="font-semibold text-slate-700">
                    {selectedService?.name}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card
                  className={cn(
                    "cursor-pointer transition-all duration-300",
                    selectedProfessional === null
                      ? "ring-2 ring-offset-2 shadow-md"
                      : "hover:shadow-md"
                  )}
                  style={
                    selectedProfessional === null
                      ? { "--tw-ring-color": brandColor }
                      : {}
                  }
                  onClick={() => setSelectedProfessional(null)}
                >
                  <CardBody>
                    <div className="flex items-center gap-4">
                      <div
                        className="h-14 w-14 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                      >
                        <ShuffleUsers className="h-7 w-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900">
                          Qualquer profissional disponível
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          Primeiro horário disponível
                        </p>
                      </div>
                      <Badge variant="info" className="shrink-0">
                        Recomendado
                      </Badge>
                    </div>
                  </CardBody>
                </Card>

                {availableProfessionals.map((pro) => (
                  <Card
                    key={pro.id}
                    className={cn(
                      "cursor-pointer transition-all duration-300",
                      selectedProfessional?.id === pro.id
                        ? "ring-2 ring-offset-2 shadow-md"
                        : "hover:shadow-md"
                    )}
                    style={
                      selectedProfessional?.id === pro.id
                        ? { "--tw-ring-color": pro.color || brandColor }
                        : {}
                    }
                    onClick={() => setSelectedProfessional(pro)}
                  >
                    <CardBody>
                      <div className="flex items-center gap-4">
                        <Avatar
                          src={pro.avatar}
                          name={pro.name}
                          size="lg"
                          style={pro.avatar ? {} : { backgroundColor: `${pro.color || brandColor}20`, color: pro.color || brandColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900">{pro.name}</h3>
                          <p className="text-sm text-slate-500 mt-0.5">{pro.role}</p>
                          <Badge variant="success" className="mt-2">
                            Atende {selectedService?.name}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant={selectedProfessional?.id === pro.id ? "primary" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProfessional(pro);
                          }}
                          style={
                            selectedProfessional?.id === pro.id
                              ? { backgroundColor: pro.color || brandColor }
                              : {}
                          }
                        >
                          {selectedProfessional?.id === pro.id ? "Selecionado" : "Selecionar"}
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {availableProfessionals.length === 0 && (
                <Alert variant="warning" title="Atenção">
                  Não há profissionais específicos para este serviço. A opção &quot;Qualquer profissional disponível&quot; já está selecionada.
                </Alert>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                  Selecione a data
                </h2>
                <p className="text-slate-500 text-sm sm:text-base">
                  {selectedProfessional
                    ? `Com ${selectedProfessional.name}`
                    : "Qualquer profissional disponível"}
                </p>
              </div>

              <Card>
                <CardBody>
                  <PublicCalendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    brandColor={brandColor}
                  />
                </CardBody>
              </Card>

              {selectedDate && (
                <Alert
                  variant="info"
                  title="Data selecionada"
                  dismissible={false}
                >
                  {formatFullDate(selectedDate)}
                </Alert>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                  Selecione o horário
                </h2>
                <p className="text-slate-500 text-sm sm:text-base">
                  {formatFullDate(selectedDate)} •{" "}
                  {selectedProfessional
                    ? selectedProfessional.name
                    : "Qualquer profissional"}
                </p>
              </div>

              <Card>
                <CardBody>
                  {loadingSlots ? (
                    <div className="text-center py-12 text-slate-500">
                      Carregando horários...
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                      {Array.from({ length: 14 }, (_, i) => {
                        const h = 8 + Math.floor(i / 2);
                        const m = (i % 2) * 30;
                        const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                        const isAvailable = availableSlots.includes(time);
                        return (
                          <TimeSlot
                            key={time}
                            time={time}
                            available={isAvailable}
                            selected={selectedTime === time}
                            onSelect={setSelectedTime}
                            brandColor={brandColor}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      Nenhum horário disponível para esta data. Tente outra data.
                    </div>
                  )}
                </CardBody>
              </Card>

              {selectedTime && (
                <Alert variant="success" title="Horário selecionado" dismissible={false}>
                  {formatFullDate(selectedDate)} às {selectedTime}
                </Alert>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                  Seus dados
                </h2>
                <p className="text-slate-500 text-sm sm:text-base">
                  Preencha seus dados para confirmar o agendamento
                </p>
              </div>

              <Card>
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nome completo"
                      required
                      leftIcon={<User className="h-4 w-4" />}
                      placeholder="Seu nome"
                      value={clientData.name}
                      onChange={(e) => {
                        setClientData({ ...clientData, name: e.target.value });
                        if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                      }}
                      error={formErrors.name}
                    />
                    <Input
                      label="Telefone"
                      required
                      leftIcon={<Phone className="h-4 w-4" />}
                      placeholder="(00) 00000-0000"
                      value={clientData.phone}
                      onChange={(e) => {
                        setClientData({ ...clientData, phone: e.target.value });
                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: "" });
                      }}
                      error={formErrors.phone}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="WhatsApp"
                      leftIcon={<MessageCircle className="h-4 w-4 text-green-600" />}
                      placeholder="(00) 00000-0000"
                      value={clientData.whatsapp}
                      onChange={(e) =>
                        setClientData({ ...clientData, whatsapp: e.target.value })
                      }
                    />
                    <Input
                      label="E-mail"
                      required
                      type="email"
                      leftIcon={<Mail className="h-4 w-4" />}
                      placeholder="seu@email.com"
                      value={clientData.email}
                      onChange={(e) => {
                        setClientData({ ...clientData, email: e.target.value });
                        if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                      }}
                      error={formErrors.email}
                    />
                  </div>
                  <Textarea
                    label="Observações"
                    leftIcon={<FileText className="h-4 w-4" />}
                    placeholder="Alguma observação para o profissional?"
                    rows={3}
                    value={clientData.notes}
                    onChange={(e) =>
                      setClientData({ ...clientData, notes: e.target.value })
                    }
                  />

                  <div
                    className="rounded-lg p-4 flex items-start gap-3"
                    style={{ backgroundColor: `${brandColor}0f`, border: `1px solid ${brandColor}30` }}
                  >
                    <div style={{ color: brandColor }}>
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-slate-700">
                      Você receberá a confirmação por WhatsApp e e-mail.
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                  Resumo do agendamento
                </h2>
                <p className="text-slate-500 text-sm sm:text-base">
                  Confira os detalhes antes de confirmar
                </p>
              </div>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Detalhes do agendamento</CardTitle>
                  <CardDescription>Verifique todas as informações abaixo</CardDescription>
                </CardHeader>
                <CardBody className="space-y-5">
                  <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                    >
                      <Scissors className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Serviço</p>
                      <p className="font-semibold text-slate-900 mt-0.5">{selectedService?.name}</p>
                      {selectedService?.description && (
                        <p className="text-sm text-slate-500 mt-1">{selectedService.description}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className="text-lg font-bold"
                        style={{ color: brandColor }}
                      >
                        {formatCurrencyBRL(selectedService?.price)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-start gap-3">
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                      >
                        <User className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Profissional</p>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {selectedProfessional?.name || "Qualquer profissional"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                      >
                        <Clock className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Duração</p>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {selectedService?.duration} minutos
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-start gap-3">
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                      >
                        <Calendar className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Data</p>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {formatFullDate(selectedDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                      >
                        <Clock className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Horário</p>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {selectedTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Seus dados</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <span className="text-slate-500">Nome: </span>
                        <span className="font-medium text-slate-800">{clientData.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Telefone: </span>
                        <span className="font-medium text-slate-800">{clientData.phone}</span>
                      </div>
                      {clientData.whatsapp && (
                        <div>
                          <span className="text-slate-500">WhatsApp: </span>
                          <span className="font-medium text-slate-800">{clientData.whatsapp}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-500">E-mail: </span>
                        <span className="font-medium text-slate-800">{clientData.email}</span>
                      </div>
                    </div>
                    {clientData.notes && (
                      <div className="pt-2 text-sm">
                        <span className="text-slate-500">Observações: </span>
                        <span className="font-medium text-slate-800">{clientData.notes}</span>
                      </div>
                    )}
                  </div>

                  <div
                    className="rounded-xl p-4 sm:p-5 flex items-center justify-between"
                    style={{
                      background: `linear-gradient(135deg, ${brandColor}15 0%, ${brandColor}08 100%)`,
                      border: `1px solid ${brandColor}30`,
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">Valor Total</p>
                      <p className="text-xs text-slate-500 mt-0.5">Pagamento no local</p>
                    </div>
                    <p
                      className="text-2xl sm:text-3xl font-bold"
                      style={{ color: brandColor }}
                    >
                      {formatCurrencyBRL(selectedService?.price)}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={createAccount}
                        onChange={(e) => setCreateAccount(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 focus:ring-brand-500 shrink-0"
                        style={{ accentColor: brandColor }}
                      />
                      <span className="text-sm text-slate-700">
                        Desejo criar uma conta para acompanhar meus agendamentos
                      </span>
                    </label>

                    {createAccount && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7 pt-1 animate-fade-in">
                        <Input
                          label="Senha"
                          type="password"
                          required
                          leftIcon={<Lock className="h-4 w-4" />}
                          placeholder="Mínimo 6 caracteres"
                          value={accountData.password}
                          onChange={(e) => {
                            setAccountData({ ...accountData, password: e.target.value });
                            if (formErrors.password) setFormErrors({ ...formErrors, password: "" });
                          }}
                          error={formErrors.password}
                        />
                        <Input
                          label="Confirmar senha"
                          type="password"
                          required
                          leftIcon={<Lock className="h-4 w-4" />}
                          placeholder="Repita a senha"
                          value={accountData.confirmPassword}
                          onChange={(e) => {
                            setAccountData({ ...accountData, confirmPassword: e.target.value });
                            if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: "" });
                          }}
                          error={formErrors.confirmPassword}
                        />
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              <Button
                size="lg"
                className="w-full h-14 text-base"
                loading={confirming}
                onClick={handleConfirm}
                style={{ backgroundColor: brandColor }}
              >
                {confirming ? "Confirmando..." : "Confirmar agendamento"}
              </Button>

              <p className="text-center text-xs text-slate-500">
                Ao confirmar, você concorda com os{" "}
                <a href="#" className="underline hover:text-slate-700">
                  Termos
                </a>{" "}
                e{" "}
                <a href="#" className="underline hover:text-slate-700">
                  Política de Privacidade
                </a>
                .
              </p>
            </div>
          )}
        </div>

        {currentStep < 6 && (
          <div className="mt-8 sm:mt-10 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between sm:items-center sticky bottom-4 sm:static bg-white/95 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none p-3 sm:p-0 -mx-4 sm:mx-0 rounded-t-xl sm:rounded-none border-t sm:border-0 border-slate-200 shadow-lg sm:shadow-none z-30">
            <Button
              variant="outline"
              size="lg"
              icon={<ArrowLeft className="h-4 w-4" />}
              onClick={handleBack}
              className="w-full sm:w-auto"
            >
              {currentStep === 1 ? "Voltar para empresa" : "Voltar"}
            </Button>
            <Button
              size="lg"
              onClick={handleNext}
              className="w-full sm:w-auto"
              style={{ backgroundColor: brandColor }}
            >
              {currentStep === 5 ? "Ir para resumo" : "Avançar"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
