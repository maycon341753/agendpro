import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
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
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Alert from "@/components/ui/Alert";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import ProgressBar from "@/components/ui/ProgressBar";
import { useToast } from "@/hooks/useToast";
import appointmentService from "@/services/appointmentService";
import clientService from "@/services/clientService";
import availabilityService from "@/services/availabilityService";
import notificationService from "@/services/notificationService";
import professionalService from "@/services/professionalService";
import serviceService from "@/services/serviceService";
import { APPOINTMENT_STATUS, PAYMENT_METHODS } from "@/utils/constants";
import {
  formatCurrencyBRL,
  formatDateBR,
  formatTime,
} from "@/utils/format";
import {
  ArrowLeft,
  UserPlus,
  CalendarCheck,
  Save,
  ChevronRight,
  ChevronLeft,
  User,
  Scissors,
  Users,
  Calendar,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-50">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  </div>
);

const STEPS = [
  { id: 1, name: "Cliente", icon: User },
  { id: 2, name: "Serviço", icon: Scissors },
  { id: 3, name: "Profissional", icon: Users },
  { id: 4, name: "Data", icon: Calendar },
  { id: 5, name: "Horário", icon: Clock },
];

const appointmentSchema = z.object({
  clientId: z.union([z.string().min(1, "Selecione um cliente"), z.number().min(1, "Selecione um cliente")]),
  serviceId: z.union([z.string().min(1, "Selecione um serviço"), z.number().min(1, "Selecione um serviço")]),
  professionalId: z.union([z.string().min(1, "Selecione um profissional"), z.number().min(1, "Selecione um profissional")]),
  date: z.string().min(1, "Selecione uma data"),
  time: z.string().min(1, "Selecione um horário"),
  totalPrice: z.string().min(1, "Informe o valor"),
  paymentMethod: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const { clientId, date, time } = router.query;
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loadingSelects, setLoadingSelects] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [novoClienteModalOpen, setNovoClienteModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
    trigger,
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clientId: "",
      serviceId: "",
      professionalId: "",
      date: date || "",
      time: time || "",
      totalPrice: "",
      paymentMethod: "",
      status: "pending",
      notes: "",
    },
  });

  const values = watch();

  const selectedService = useMemo(
    () => services.find((s) => String(s.id) === String(values.serviceId)),
    [services, values.serviceId]
  );

  const selectedClient = useMemo(
    () => clients.find((c) => String(c.id) === String(values.clientId)),
    [clients, values.clientId]
  );

  const loadSelects = async () => {
    setLoadingSelects(true);
    try {
      const [cliRes, serRes, proRes] = await Promise.allSettled([
        clientService.list({ page: 1, limit: 300 }),
        serviceService.list
          ? serviceService.list({ page: 1, limit: 300 })
          : Promise.resolve({
              data: [
                { id: 1, name: "Corte Feminino", price: 100, duration: 60 },
                { id: 2, name: "Limpeza de Pele", price: 180, duration: 90 },
                { id: 3, name: "Massagem Relaxante", price: 150, duration: 60 },
                { id: 4, name: "Depilação Completa", price: 220, duration: 120 },
              ],
            }),
        professionalService.list
          ? professionalService.list({ page: 1, limit: 300 })
          : Promise.resolve({
              data: [
                { id: "", name: "Qualquer disponível" },
                { id: 1, name: "Ana Silva" },
                { id: 2, name: "Juliana Costa" },
                { id: 3, name: "Fernanda Lima" },
              ],
            }),
      ]);

      setClients(cliRes.status === "fulfilled" ? cliRes.value.data || [] : []);

      let servicesData = serRes.status === "fulfilled" ? serRes.value.data || [] : [];
      if (servicesData.length === 0) {
        servicesData = [
          { id: 1, name: "Corte Feminino", price: 100, duration: 60 },
          { id: 2, name: "Limpeza de Pele", price: 180, duration: 90 },
        ];
      }
      setServices(servicesData);

      let pros = proRes.status === "fulfilled" ? proRes.value.data || [] : [];
      if (pros.length === 0 || !pros.some((p) => p.id === "")) {
        pros = [{ id: "", name: "Qualquer disponível" }, ...pros];
      }
      setProfessionals(pros);

      if (clientId) {
        setValue("clientId", String(clientId));
        setStep(2);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoadingSelects(false);
    }
  };

  useEffect(() => {
    loadSelects();
  }, []);

  useEffect(() => {
    if (selectedService && !values.totalPrice) {
      setValue(
        "totalPrice",
        selectedService.price ? String(selectedService.price) : ""
      );
    }
  }, [selectedService]);

  useEffect(() => {
    if (values.date && values.serviceId && (values.professionalId !== undefined || values.professionalId === "")) {
      loadAvailableSlots();
    }
  }, [values.date, values.serviceId, values.professionalId]);

  const loadAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const res = await availabilityService.getAvailableSlotsAPI(null, {
        serviceId: values.serviceId,
        professionalId: values.professionalId || null,
        date: values.date,
        interval: 30,
      });

      if (res && res.length > 0) {
        setAvailableSlots(res);
      } else {
        const gen = [];
        for (let h = 8; h < 20; h++) {
          for (let m = 0; m < 60; m += 30) {
            gen.push(
              `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
            );
          }
        }
        setAvailableSlots(gen);
      }
    } catch (e) {
      const gen = [];
      for (let h = 8; h < 20; h++) {
        for (let m = 0; m < 60; m += 30) {
          gen.push(
            `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
          );
        }
      }
      setAvailableSlots(gen);
    } finally {
      setLoadingSlots(false);
    }
  };

  const checkConflict = async () => {
    try {
      const res = await availabilityService.checkConflictAPI(null, {
        professionalId: values.professionalId || null,
        date: values.date,
        startTime: values.time,
        duration: selectedService?.duration || 60,
      });

      if (res?.hasConflict) {
        setConflictInfo(res);
        return true;
      }
      setConflictInfo(null);
      return false;
    } catch (e) {
      setConflictInfo(null);
      return false;
    }
  };

  const nextStep = async () => {
    if (step === 1) {
      const ok = await trigger(["clientId"]);
      if (!ok) return;
    } else if (step === 2) {
      const ok = await trigger(["serviceId"]);
      if (!ok) return;
    } else if (step === 3) {
      const ok = await trigger(["professionalId"]);
      if (!ok) return;
    } else if (step === 4) {
      const ok = await trigger(["date"]);
      if (!ok) return;
    }
    setStep((s) => Math.min(5, s + 1));
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = async (data) => {
    const hasConflict = await checkConflict();
    if (hasConflict) {
      return;
    }

    setSaving(true);
    try {
      const startDate = new Date(`${data.date}T${data.time}:00`);
      const duration = selectedService?.duration || 60;
      const endDate = new Date(startDate.getTime() + duration * 60000);

      const appointment = await appointmentService.create({
        clientId: data.clientId,
        clientName: selectedClient?.name,
        serviceId: data.serviceId,
        serviceName: selectedService?.name,
        professionalId: data.professionalId || null,
        professionalName: professionals.find(
          (p) => String(p.id) === String(data.professionalId)
        )?.name,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        status: data.status || "pending",
        notes: data.notes,
        totalPrice: Number(data.totalPrice),
        paymentMethod: data.paymentMethod,
        paid: data.paymentMethod ? true : false,
      });

      try {
        if (notificationService?.appointmentCreated) {
          await notificationService.appointmentCreated(appointment);
        }
      } catch (_) {}

      toast({
        title: "Agendamento criado!",
        description: `${selectedClient?.name || ""} - ${selectedService?.name || ""}`,
        variant: "success",
      });

      router.push("/agendamentos");
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o agendamento.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNovoClienteSuccess = (cliente) => {
    setClients((prev) => [cliente, ...prev]);
    setValue("clientId", String(cliente.id));
    setNovoClienteModalOpen(false);
    clearErrors("clientId");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/agendamentos" passHref legacyBehavior>
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="h-7 w-7 text-brand-600" />
              Novo Agendamento
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Preencha os dados para criar um novo agendamento
            </p>
          </div>
        </div>

        <Card>
          <CardBody>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {STEPS.map((s) => {
                  const Icon = s.icon;
                  const active = s.id === step;
                  const done = s.id < step;
                  return (
                    <React.Fragment key={s.id}>
                      <button
                        type="button"
                        onClick={() => s.id <= 5 && setStep(s.id)}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all ${
                            active
                              ? "bg-brand-600 border-brand-600 text-white shadow-md"
                              : done
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "bg-white border-slate-300 text-slate-400 group-hover:border-brand-400 group-hover:text-brand-500"
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <span
                          className={`text-[11px] font-medium hidden sm:block ${
                            active
                              ? "text-brand-700"
                              : done
                              ? "text-slate-600"
                              : "text-slate-400"
                          }`}
                        >
                          {s.name}
                        </span>
                      </button>
                      {s.id < STEPS.length && (
                        <div className="flex-1 mx-2">
                          <ProgressBar
                            value={s.id < step ? 100 : 0}
                            showLabel={false}
                            className="h-1 rounded-full bg-slate-200"
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <ProgressBar
                value={(step / STEPS.length) * 100}
                showLabel={false}
                className="h-1.5 rounded-full bg-slate-200"
              />
            </div>

            {conflictInfo && (
              <div className="mb-6">
                <Alert
                  variant="danger"
                  title="Conflito de horário detectado!"
                  dismissible
                  onClose={() => setConflictInfo(null)}
                >
                  <div className="space-y-2">
                    <p>
                      Já existe um agendamento no horário selecionado para este
                      profissional:
                    </p>
                    {conflictInfo.conflictingAppointments?.map((apt) => (
                      <div
                        key={apt.id}
                        className="bg-white rounded-md border border-red-200 p-3 text-xs"
                      >
                        <strong>{apt.clientName || "Cliente"}</strong> -{" "}
                        {apt.serviceName || "Serviço"}
                        <div className="text-slate-600 mt-1">
                          {formatDateBR(apt.start)} das {formatTime(apt.start)}{" "}
                          às {formatTime(apt.end)}
                          {apt.professionalName && ` com ${apt.professionalName}`}
                        </div>
                      </div>
                    ))}
                    <p className="font-medium">
                      Escolha outro horário ou profissional.
                    </p>
                  </div>
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              {step === 1 && (
                <StepCliente
                  clients={clients}
                  selectedClient={selectedClient}
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  loadingSelects={loadingSelects}
                  onAbrirNovoCliente={() => setNovoClienteModalOpen(true)}
                  search={values.clientSearch}
                />
              )}

              {step === 2 && (
                <StepServico
                  services={services}
                  selectedService={selectedService}
                  register={register}
                  errors={errors}
                  loadingSelects={loadingSelects}
                />
              )}

              {step === 3 && (
                <StepProfissional
                  professionals={professionals}
                  register={register}
                  errors={errors}
                  loadingSelects={loadingSelects}
                  selectedService={selectedService}
                />
              )}

              {step === 4 && (
                <StepData
                  register={register}
                  errors={errors}
                  defaultDate={values.date}
                />
              )}

              {step === 5 && (
                <StepHorarioEFinalizacao
                  register={register}
                  errors={errors}
                  availableSlots={availableSlots}
                  loadingSlots={loadingSlots}
                  selectedService={selectedService}
                  selectedClient={selectedClient}
                  professionalName={
                    professionals.find(
                      (p) => String(p.id) === String(values.professionalId)
                    )?.name || ""
                  }
                  values={values}
                  setValue={setValue}
                />
              )}

              <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
                <div>
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      icon={<ChevronLeft className="h-4 w-4" />}
                      onClick={prevStep}
                    >
                      Anterior
                    </Button>
                  ) : (
                    <Link href="/agendamentos" passHref legacyBehavior>
                      <Button variant="outline" type="button">
                        Cancelar
                      </Button>
                    </Link>
                  )}
                </div>
                <div>
                  {step < STEPS.length ? (
                    <Button
                      type="button"
                      iconRight={<ChevronRight className="h-4 w-4" />}
                      onClick={nextStep}
                    >
                      Próximo
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      loading={saving}
                      icon={<Save className="h-4 w-4" />}
                    >
                      {saving ? "Criando..." : "Criar Agendamento"}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardBody>
        </Card>

        <NovoClienteRapidoModal
          open={novoClienteModalOpen}
          onClose={() => setNovoClienteModalOpen(false)}
          onSuccess={handleNovoClienteSuccess}
        />
      </div>
    </AdminLayout>
  );
}

function StepCliente({
  clients,
  selectedClient,
  register,
  errors,
  setValue,
  loadingSelects,
  onAbrirNovoCliente,
}) {
  const [search, setSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(s)) ||
      (c.phone && c.phone.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-5">
      <div>
        <CardTitle className="mb-1 flex items-center gap-2">
          <User className="h-5 w-5 text-brand-600" />
          Selecione o Cliente
        </CardTitle>
        <CardDescription>
          Busque e selecione o cliente para o agendamento
        </CardDescription>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar cliente por nome, telefone ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          icon={<UserPlus className="h-4 w-4" />}
          onClick={onAbrirNovoCliente}
        >
          Novo cliente
        </Button>
      </div>

      {loadingSelects ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              {search ? "Nenhum cliente encontrado." : "Sem clientes."}
            </div>
          ) : (
            filtered.map((c) => {
              const selected = selectedClient?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setValue("clientId", String(c.id), {
                      shouldValidate: true,
                    });
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-slate-100 last:border-b-0 transition-colors ${
                    selected
                      ? "bg-brand-50 border-l-4 border-l-brand-600"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <Avatar size="sm" name={c.name} src={c.avatar} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      {c.name}
                    </div>
                    <div className="text-xs text-slate-500 flex gap-2 flex-wrap">
                      {c.phone && <span>{c.phone}</span>}
                      {c.email && <span>• {c.email}</span>}
                    </div>
                  </div>
                  {selected && (
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Selecionado
                    </Badge>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}

      <select
        className="hidden"
        {...register("clientId")}
        defaultValue=""
      ></select>
      {errors.clientId && (
        <p className="text-red-500 text-sm">{errors.clientId.message}</p>
      )}
    </div>
  );
}

function StepServico({ services, selectedService, register, errors, loadingSelects }) {
  return (
    <div className="space-y-5">
      <div>
        <CardTitle className="mb-1 flex items-center gap-2">
          <Scissors className="h-5 w-5 text-brand-600" />
          Selecione o Serviço
        </CardTitle>
        <CardDescription>
          Escolha qual serviço será realizado
        </CardDescription>
      </div>

      {loadingSelects ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((s) => {
            const selected = selectedService?.id === s.id;
            return (
              <label
                key={s.id}
                className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                  selected
                    ? "border-brand-500 bg-brand-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-brand-300"
                }`}
              >
                <input
                  type="radio"
                  className="sr-only peer"
                  {...register("serviceId")}
                  value={String(s.id)}
                />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {s.name}
                    </div>
                    {s.duration && (
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Duração: {s.duration} min
                      </div>
                    )}
                    {s.description && (
                      <div className="text-xs text-slate-500 mt-1">
                        {s.description}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-emerald-700">
                      {formatCurrencyBRL(s.price)}
                    </div>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}
      {errors.serviceId && (
        <p className="text-red-500 text-sm">{errors.serviceId.message}</p>
      )}
    </div>
  );
}

function StepProfissional({
  professionals,
  register,
  errors,
  loadingSelects,
  selectedService,
}) {
  return (
    <div className="space-y-5">
      <div>
        <CardTitle className="mb-1 flex items-center gap-2">
          <Users className="h-5 w-5 text-brand-600" />
          Selecione o Profissional
        </CardTitle>
        <CardDescription>
          Escolha um profissional específico ou deixe o sistema escolher o
          primeiro disponível
        </CardDescription>
      </div>

      {loadingSelects ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {professionals.map((p, idx) => (
            <label
              key={idx + "-" + (p.id || "any")}
              className="cursor-pointer"
            >
              <input
                type="radio"
                className="sr-only peer"
                {...register("professionalId")}
                value={String(p.id ?? "")}
              />
              <div className="rounded-xl border-2 p-4 transition-all peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:shadow-md border-slate-200 bg-white hover:border-brand-300 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <Avatar size="md" name={p.name} src={p.avatar} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                      {p.name}
                    </div>
                    {p.id === "" ? (
                      <div className="text-xs text-brand-600 mt-0.5">
                        Sistema escolhe o disponível
                      </div>
                    ) : (
                      p.specialty && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {p.specialty}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      )}
      {errors.professionalId && (
        <p className="text-red-500 text-sm">
          {errors.professionalId.message}
        </p>
      )}
    </div>
  );
}

function StepData({ register, errors, defaultDate }) {
  const today = new Date();
  const min = today.toISOString().split("T")[0];
  return (
    <div className="space-y-5">
      <div>
        <CardTitle className="mb-1 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-brand-600" />
          Selecione a Data
        </CardTitle>
        <CardDescription>
          Escolha a data para o agendamento
        </CardDescription>
      </div>
      <div className="max-w-xs">
        <Input
          type="date"
          label="Data do agendamento"
          required
          min={min}
          leftIcon={<Calendar className="h-4 w-4" />}
          defaultValue={defaultDate || ""}
          error={errors.date?.message}
          {...register("date")}
        />
      </div>
    </div>
  );
}

function StepHorarioEFinalizacao({
  register,
  errors,
  availableSlots,
  loadingSlots,
  selectedService,
  selectedClient,
  professionalName,
  values,
  setValue,
}) {
  return (
    <div className="space-y-5">
      <div>
        <CardTitle className="mb-1 flex items-center gap-2">
          <Clock className="h-5 w-5 text-brand-600" />
          Horário e Finalização
        </CardTitle>
        <CardDescription>
          Selecione o horário e confira os detalhes do agendamento
        </CardDescription>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">
          Horários disponíveis
        </p>
        {loadingSlots ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : availableSlots.length === 0 ? (
          <Alert variant="warning" title="Sem horários disponíveis">
            Tente outra data ou profissional.
          </Alert>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-52 overflow-y-auto p-1">
            {availableSlots.map((slot) => {
              const selected = values.time === slot;
              return (
                <button
                  type="button"
                  key={slot}
                  onClick={() =>
                    setValue("time", slot, { shouldValidate: true })
                  }
                  className={`py-2.5 rounded-lg border font-semibold text-sm transition-all ${
                    selected
                      ? "bg-brand-600 text-white border-brand-600 shadow-md"
                      : "bg-white border-slate-200 text-slate-700 hover:border-brand-400 hover:bg-brand-50"
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        )}
        <select className="hidden" {...register("time")}></select>
        {errors.time && (
          <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-emerald-600" />
          Resumo e Pagamento
        </h4>
        <div className="space-y-3 mb-5 pb-5 border-b border-slate-200">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Cliente:</span>
            <span className="font-medium">{selectedClient?.name || "-"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Serviço:</span>
            <span className="font-medium">{selectedService?.name || "-"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Profissional:</span>
            <span className="font-medium">{professionalName || "Qualquer"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Data:</span>
            <span className="font-medium">
              {values.date ? formatDateBR(values.date) : "-"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Horário:</span>
            <span className="font-medium">{values.time || "-"}</span>
          </div>
          {selectedService?.duration && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Duração:</span>
              <span className="font-medium">
                {selectedService.duration} minutos
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Valor do serviço (R$)"
              type="number"
              step="0.01"
              required
              leftIcon={<DollarSign className="h-4 w-4" />}
              error={errors.totalPrice?.message}
              {...register("totalPrice")}
            />
          </div>
          <Select
            label="Status inicial"
            options={[
              { value: "pending", label: "Pendente" },
              { value: "confirmed", label: "Confirmado" },
            ]}
            {...register("status")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Select
            label="Forma de Pagamento (opcional)"
            options={[
              { value: "", label: "Definir depois" },
              ...PAYMENT_METHODS,
            ]}
            {...register("paymentMethod")}
          />
        </div>

        <div className="mt-4">
          <Textarea
            label="Observações (opcional)"
            placeholder="Alguma observação sobre o agendamento?"
            rows={3}
            {...register("notes")}
          />
        </div>
      </div>
    </div>
  );
}

function NovoClienteRapidoModal({ open, onClose, onSuccess }) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      whatsapp: "",
      email: "",
    },
  });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const created = await clientService.create({
        ...data,
        status: "active",
      });
      toast({
        title: "Cliente cadastrado!",
        variant: "success",
      });
      onSuccess?.(created);
    } catch (e) {
      toast({ title: "Erro", description: e.message, variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="md">
      <ModalHeader>
        <ModalTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-brand-600" />
          Cadastro Rápido de Cliente
        </ModalTitle>
      </ModalHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="space-y-4">
          <Input
            label="Nome Completo"
            required
            error={errors.name?.message}
            {...register("name", { required: true })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Telefone"
              required
              error={errors.phone?.message}
              {...register("phone", { required: true })}
            />
            <Input
              label="WhatsApp"
              {...register("whatsapp")}
            />
          </div>
          <Input
            label="E-mail"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <p className="text-xs text-slate-500">
            Você pode completar o cadastro completo depois na página do cliente.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Link href="/clientes/novo" passHref legacyBehavior>
            <Button variant="ghost" type="button" disabled={saving}>
              Cadastro Completo
            </Button>
          </Link>
          <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
            Cadastrar
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
