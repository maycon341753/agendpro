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
import DialogConfirm from "@/components/ui/DialogConfirm";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/hooks/useToast";
import appointmentService from "@/services/appointmentService";
import clientService from "@/services/clientService";
import availabilityService from "@/services/availabilityService";
import professionalService from "@/services/professionalService";
import serviceService from "@/services/serviceService";
import { APPOINTMENT_STATUS, PAYMENT_METHODS } from "@/utils/constants";
import {
  formatCurrencyBRL,
  formatDateBR,
  formatDateTimeBR,
  formatTime,
} from "@/utils/format";
import {
  ArrowLeft,
  Save,
  CalendarCheck,
  User,
  Scissors,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Trash2,
  CheckCircle2,
  PlayCircle,
  XCircle,
  UserX,
  Eye,
  Pencil,
} from "lucide-react";

const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-50">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  </div>
);

const STATUS_BADGE_VARIANT = {
  pending: "warning",
  confirmed: "info",
  in_progress: "default",
  completed: "success",
  cancelled: "muted",
  no_show: "danger",
};

const editSchema = z.object({
  clientId: z.union([z.string().min(1), z.number().min(1)]),
  serviceId: z.union([z.string().min(1), z.number().min(1)]),
  professionalId: z.union([z.string().min(1), z.number().min(1), z.literal("")]),
  date: z.string().min(1),
  time: z.string().min(1),
  totalPrice: z.string().min(1),
  paymentMethod: z.string().optional(),
  paid: z.boolean().optional(),
  status: z.string().min(1),
  notes: z.string().optional(),
});

export default function AgendamentoDetalhePage() {
  const router = useRouter();
  const { id, edit } = router.query;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(!!edit);
  const [appointment, setAppointment] = useState(null);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      clientId: "",
      serviceId: "",
      professionalId: "",
      date: "",
      time: "",
      totalPrice: "",
      paymentMethod: "",
      paid: false,
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

  const loadAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [apt, cliRes, serRes, proRes] = await Promise.allSettled([
        appointmentService.get(id),
        clientService.list({ page: 1, limit: 300 }),
        serviceService.list
          ? serviceService.list({ page: 1, limit: 300 })
          : Promise.resolve({
              data: [
                { id: 1, name: "Corte Feminino", price: 100, duration: 60 },
                { id: 2, name: "Limpeza de Pele", price: 180, duration: 90 },
              ],
            }),
        professionalService.list
          ? professionalService.list({ page: 1, limit: 300 })
          : Promise.resolve({
              data: [
                { id: "", name: "Qualquer disponível" },
                { id: 1, name: "Ana Silva" },
                { id: 2, name: "Juliana Costa" },
              ],
            }),
      ]);

      const aptData = apt.status === "fulfilled" ? apt.value : null;
      setAppointment(aptData);

      setClients(cliRes.status === "fulfilled" ? cliRes.value.data || [] : []);

      let serData = serRes.status === "fulfilled" ? serRes.value.data || [] : [];
      if (serData.length === 0) {
        serData = [
          { id: 1, name: "Corte Feminino", price: 100, duration: 60 },
          { id: 2, name: "Limpeza de Pele", price: 180, duration: 90 },
        ];
      }
      setServices(serData);

      let proData = proRes.status === "fulfilled" ? proRes.value.data || [] : [];
      if (proData.length === 0 || !proData.some((p) => p.id === "")) {
        proData = [{ id: "", name: "Qualquer disponível" }, ...proData];
      }
      setProfessionals(proData);

      if (aptData) {
        const start = new Date(aptData.start);
        reset({
          clientId: String(aptData.clientId || ""),
          serviceId: String(aptData.serviceId || ""),
          professionalId: aptData.professionalId
            ? String(aptData.professionalId)
            : "",
          date: start.toISOString().split("T")[0],
          time: formatTime(start),
          totalPrice: String(aptData.totalPrice || ""),
          paymentMethod: aptData.paymentMethod || "",
          paid: aptData.paid || false,
          status: aptData.status || "pending",
          notes: aptData.notes || "",
        });
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  useEffect(() => {
    if (values.date && values.serviceId && isEditing) {
      loadSlots();
    }
  }, [values.date, values.serviceId, values.professionalId, isEditing]);

  const loadSlots = async () => {
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
      setAvailableSlots([]);
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
        const hasOtherId = res.conflictingAppointments?.some(
          (a) => String(a.id) !== String(id)
        );
        if (hasOtherId) {
          setConflictInfo(res);
          return true;
        }
      }
      setConflictInfo(null);
      return false;
    } catch (e) {
      return false;
    }
  };

  const onSubmit = async (data) => {
    const hasConflict = await checkConflict();
    if (hasConflict) return;

    setSaving(true);
    try {
      const startDate = new Date(`${data.date}T${data.time}:00`);
      const duration = selectedService?.duration || 60;
      const endDate = new Date(startDate.getTime() + duration * 60000);

      const updated = await appointmentService.update(id, {
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
        status: data.status,
        notes: data.notes,
        totalPrice: Number(data.totalPrice),
        paymentMethod: data.paymentMethod,
        paid: data.paid || !!data.paymentMethod,
      });

      setAppointment(updated);
      toast({
        title: "Agendamento atualizado!",
        variant: "success",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (newStatus, successMsg) => {
    setActionLoading(true);
    try {
      const res = await appointmentService.update(id, { status: newStatus });
      setAppointment((p) => (p ? { ...p, status: newStatus } : p));
      setValue("status", newStatus);
      toast({ title: "Sucesso!", description: successMsg, variant: "success" });
    } catch (e) {
      toast({
        title: "Erro",
        description: e.message,
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await appointmentService.remove(id);
      toast({ title: "Agendamento excluído.", variant: "success" });
      router.push("/agendamentos");
    } catch (e) {
      toast({ title: "Erro", description: e.message, variant: "error" });
    } finally {
      setActionLoading(false);
      setDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-20" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-7 w-72" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  if (!appointment) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <p className="text-slate-600">Agendamento não encontrado.</p>
          <Link href="/agendamentos" passHref legacyBehavior>
            <Button className="mt-4" variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
              Voltar
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const apt = appointment;
  const statusConf = APPOINTMENT_STATUS[apt.status];
  const start = new Date(apt.start);
  const end = new Date(apt.end);

  const canConfirm = ["pending"].includes(apt.status);
  const canStart = ["confirmed", "pending"].includes(apt.status);
  const canComplete = ["in_progress", "confirmed"].includes(apt.status);
  const canCancel = ["pending", "confirmed", "in_progress"].includes(apt.status);
  const canNoShow = ["pending", "confirmed"].includes(apt.status);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/agendamentos" passHref legacyBehavior>
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Voltar
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="h-7 w-7 text-brand-600" />
                  Agendamento #{apt.id}
                </h1>
                <Badge variant={STATUS_BADGE_VARIANT[apt.status] || "default"}>
                  {statusConf?.label || apt.status}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {formatDateTimeBR(start)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Pencil className="h-4 w-4" />}
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </Button>
                {canConfirm && (
                  <Button
                    size="sm"
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    disabled={actionLoading}
                    onClick={() =>
                      changeStatus("confirmed", "Agendamento confirmado.")
                    }
                  >
                    Confirmar
                  </Button>
                )}
                {canStart && (
                  <Button
                    size="sm"
                    icon={<PlayCircle className="h-4 w-4" />}
                    disabled={actionLoading}
                    onClick={() =>
                      changeStatus("in_progress", "Atendimento iniciado.")
                    }
                  >
                    Iniciar
                  </Button>
                )}
                {canComplete && (
                  <Button
                    size="sm"
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    disabled={actionLoading}
                    onClick={() =>
                      changeStatus("completed", "Atendimento concluído.")
                    }
                  >
                    Concluir
                  </Button>
                )}
                {canNoShow && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<UserX className="h-4 w-4" />}
                    disabled={actionLoading}
                    onClick={() =>
                      changeStatus("no_show", "Marcado como não compareceu.")
                    }
                    className="text-red-700 border-red-200 hover:bg-red-50"
                  >
                    Não Compareceu
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<XCircle className="h-4 w-4" />}
                    disabled={actionLoading}
                    onClick={() =>
                      changeStatus("cancelled", "Agendamento cancelado.")
                    }
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Trash2 className="h-4 w-4 text-red-600" />}
                  className="text-red-700 border-red-200 hover:bg-red-50"
                  onClick={() => setDeleteDialog(true)}
                >
                  Excluir
                </Button>
              </>
            ) : null}
          </div>
        </div>

        {!isEditing ? (
          <DetailView
            appointment={apt}
            client={selectedClient || clients.find((c) => String(c.id) === String(apt.clientId))}
            service={selectedService || services.find((s) => String(s.id) === String(apt.serviceId))}
          />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {conflictInfo && (
              <div className="mb-6">
                <Alert
                  variant="danger"
                  title="Conflito de horário!"
                  dismissible
                  onClose={() => setConflictInfo(null)}
                >
                  <div>
                    {conflictInfo.conflictingAppointments
                      ?.filter((a) => String(a.id) !== String(id))
                      .map((c) => (
                        <div key={c.id} className="text-sm">
                          <strong>{c.clientName}</strong> - {c.serviceName} em{" "}
                          {formatDateBR(c.start)} às {formatTime(c.start)}
                        </div>
                      ))}
                  </div>
                </Alert>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-brand-600" />
                  Editar Agendamento
                </CardTitle>
                <CardDescription>
                  Atualize os dados do agendamento
                </CardDescription>
              </CardHeader>
              <CardBody className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Select
                      label="Cliente"
                      required
                      options={[
                        { value: "", label: "Selecione..." },
                        ...clients.map((c) => ({
                          value: String(c.id),
                          label: c.name,
                        })),
                      ]}
                      error={errors.clientId?.message}
                      {...register("clientId")}
                    />
                  </div>
                  <div>
                    <Select
                      label="Serviço"
                      required
                      options={[
                        { value: "", label: "Selecione..." },
                        ...services.map((s) => ({
                          value: String(s.id),
                          label: s.name,
                        })),
                      ]}
                      error={errors.serviceId?.message}
                      {...register("serviceId")}
                    />
                  </div>
                  <div>
                    <Select
                      label="Profissional"
                      required
                      options={professionals.map((p) => ({
                        value: String(p.id ?? ""),
                        label: p.name,
                      }))}
                      error={errors.professionalId?.message}
                      {...register("professionalId")}
                    />
                  </div>
                  <div>
                    <Select
                      label="Status"
                      required
                      options={Object.values(APPOINTMENT_STATUS).map((s) => ({
                        value: s.value,
                        label: s.label,
                      }))}
                      error={errors.status?.message}
                      {...register("status")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <Input
                      type="date"
                      label="Data"
                      required
                      error={errors.date?.message}
                      leftIcon={<Calendar className="h-4 w-4" />}
                      {...register("date")}
                    />
                  </div>
                  <div>
                    {loadingSlots ? (
                      <div className="pt-7">
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Horário
                        </label>
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                          Sem horários. Altere data/profissional.
                        </p>
                      </div>
                    ) : (
                      <Select
                        label="Horário"
                        required
                        options={availableSlots.map((s) => ({
                          value: s,
                          label: s,
                        }))}
                        error={errors.time?.message}
                        {...register("time")}
                      />
                    )}
                  </div>
                  <div>
                    <Input
                      label="Valor (R$)"
                      type="number"
                      step="0.01"
                      required
                      leftIcon={<DollarSign className="h-4 w-4" />}
                      error={errors.totalPrice?.message}
                      {...register("totalPrice")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Select
                    label="Forma de Pagamento"
                    options={[
                      { value: "", label: "Definir depois" },
                      ...PAYMENT_METHODS,
                    ]}
                    {...register("paymentMethod")}
                  />
                  <div className="pt-7 flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        {...register("paid")}
                      />
                      <span className="text-sm font-medium text-slate-700">
                        Marcado como pago
                      </span>
                    </label>
                  </div>
                </div>

                <Textarea
                  label="Observações"
                  rows={3}
                  placeholder="Informações adicionais..."
                  {...register("notes")}
                />
              </CardBody>
              <CardFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    loadAll();
                  }}
                  disabled={saving}
                >
                  Cancelar edição
                </Button>
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
        )}

        <DialogConfirm
          open={deleteDialog}
          onOpenChange={setDeleteDialog}
          title="Excluir agendamento?"
          description={`Tem certeza que deseja excluir permanentemente o agendamento #${apt.id}? Esta ação não pode ser desfeita.`}
          confirmText="Sim, excluir"
          variant="danger"
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      </div>
    </AdminLayout>
  );
}

function DetailView({ appointment, client, service }) {
  const start = new Date(appointment.start);
  const end = new Date(appointment.end);
  const durationMin = Math.round((end - start) / 60000);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-brand-600" />
            Detalhes
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="flex items-start gap-4 pb-5 border-b border-slate-200">
            <Avatar size="lg" name={appointment.clientName} src={client?.avatar} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {appointment.clientName}
                </h3>
                {client?.status === "inactive" && (
                  <Badge variant="muted">Cliente inativo</Badge>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                {client?.phone && (
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {client.phone}
                  </span>
                )}
                {client?.email && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {client.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DetailItem
              icon={<Scissors className="h-4 w-4" />}
              label="Serviço"
              value={
                <>
                  <span className="font-medium">{service?.name || appointment.serviceName}</span>
                  {service?.duration && (
                    <span className="text-xs text-slate-500 ml-2">
                      ({service.duration} min)
                    </span>
                  )}
                </>
              }
            />
            <DetailItem
              icon={<Users className="h-4 w-4" />}
              label="Profissional"
              value={appointment.professionalName || "-"}
            />
            <DetailItem
              icon={<Calendar className="h-4 w-4" />}
              label="Data"
              value={formatDateBR(start)}
            />
            <DetailItem
              icon={<Clock className="h-4 w-4" />}
              label="Horário"
              value={`${formatTime(start)} - ${formatTime(end)} (${durationMin} min)`}
            />
            <DetailItem
              icon={<DollarSign className="h-4 w-4" />}
              label="Valor Total"
              value={
                <span className="font-bold text-emerald-700">
                  {formatCurrencyBRL(appointment.totalPrice)}
                </span>
              }
            />
            <DetailItem
              icon={<DollarSign className="h-4 w-4" />}
              label="Pagamento"
              value={
                <div>
                  <Badge
                    variant={appointment.paid ? "success" : "warning"}
                  >
                    {appointment.paid ? "Pago" : "Pendente"}
                  </Badge>
                  {appointment.paymentMethod && (
                    <div className="text-xs text-slate-500 mt-1">
                      {PAYMENT_METHODS.find(
                        (m) => m.value === appointment.paymentMethod
                      )?.label || appointment.paymentMethod}
                    </div>
                  )}
                </div>
              }
            />
          </div>

          {appointment.notes && (
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Observações
              </p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-4 border border-slate-200 whitespace-pre-wrap">
                {appointment.notes}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-500">Criado em:</p>
              <p className="font-medium text-slate-700 mt-0.5">
                {appointment.createdAt
                  ? formatDateTimeBR(appointment.createdAt)
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Última atualização:</p>
              <p className="font-medium text-slate-700 mt-0.5">
                {appointment.updatedAt
                  ? formatDateTimeBR(appointment.updatedAt)
                  : "-"}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links Rápidos</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2">
          {appointment.clientId && (
            <Link
              href={`/clientes/${appointment.clientId}`}
              passHref
              legacyBehavior
            >
              <Button
                variant="outline"
                className="w-full justify-start"
                icon={<User className="h-4 w-4" />}
              >
                Ver perfil do cliente
              </Button>
            </Link>
          )}
          <Link
            href={`/agenda?date=${start.toISOString().split("T")[0]}`}
            passHref
            legacyBehavior
          >
            <Button
              variant="outline"
              className="w-full justify-start"
              icon={<CalendarCheck className="h-4 w-4" />}
            >
              Ver na agenda
            </Button>
          </Link>
          <Link
            href={`/agendamentos/novo?clientId=${appointment.clientId}`}
            passHref
            legacyBehavior
          >
            <Button
              variant="primary"
              className="w-full justify-start"
              icon={<CalendarCheck className="h-4 w-4" />}
            >
              Novo para este cliente
            </Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {icon}
        {label}
      </div>
      <div className="text-sm text-slate-800">{value}</div>
    </div>
  );
}
