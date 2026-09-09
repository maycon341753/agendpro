import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import DateRangePicker from "@/components/ui/DateRangePicker";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import DialogConfirm from "@/components/ui/DialogConfirm";
import { useToast } from "@/hooks/useToast";
import appointmentService from "@/services/appointmentService";
import clientService from "@/services/clientService";
import professionalService from "@/services/professionalService";
import serviceService from "@/services/serviceService";
import { APPOINTMENT_STATUS, PAYMENT_METHODS } from "@/utils/constants";
import { formatCurrencyBRL, formatDateBR, formatTime } from "@/utils/format";
import {
  Plus,
  Search,
  CalendarCheck,
  Pencil,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

export default function AgendamentosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [professionalId, setProfessionalId] = useState("");
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState("");
  const [serviceId, setServiceId] = useState("");

  const [clientOptions, setClientOptions] = useState([]);
  const [professionalOptions, setProfessionalOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);

  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    appointment: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadSelects = async () => {
    try {
      const [cli, pro, ser] = await Promise.allSettled([
        clientService.list({ page: 1, limit: 200 }),
        professionalService.list ? professionalService.list({ page: 1, limit: 200 }) : Promise.resolve({ data: [{ id: 1, name: "Ana Silva" }, { id: 2, name: "Juliana Costa" }] }),
        serviceService.list ? serviceService.list({ page: 1, limit: 200 }) : Promise.resolve({ data: [{ id: 1, name: "Corte Feminino" }, { id: 2, name: "Limpeza de Pele" }] }),
      ]);

      setClientOptions([
        { value: "", label: "Todos os clientes" },
        ...(cli.status === "fulfilled" && cli.value?.data
          ? cli.value.data.map((c) => ({ value: c.id, label: c.name }))
          : []),
      ]);

      setProfessionalOptions([
        { value: "", label: "Todos os profissionais" },
        ...(pro.status === "fulfilled" && pro.value?.data
          ? pro.value.data.map((p) => ({ value: p.id, label: p.name }))
          : [{ value: 1, label: "Ana Silva" }, { value: 2, label: "Juliana Costa" }]),
      ]);

      setServiceOptions([
        { value: "", label: "Todos os serviços" },
        ...(ser.status === "fulfilled" && ser.value?.data
          ? ser.value.data.map((s) => ({ value: s.id, label: s.name }))
          : [{ value: 1, label: "Corte Feminino" }, { value: 2, label: "Limpeza de Pele" }]),
      ]);
    } catch (e) {
      console.warn(e);
    }
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentService.list({
        search: searchDebounced,
        status,
        startDate: dateRange.startDate || null,
        endDate: dateRange.endDate || null,
        professionalId: professionalId || null,
        clientId: clientId || null,
        serviceId: serviceId || null,
        page,
        limit: pageSize,
      });
      setAppointments(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSelects();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [
    searchDebounced,
    status,
    dateRange.startDate,
    dateRange.endDate,
    professionalId,
    clientId,
    serviceId,
    page,
  ]);

  const confirmarAgendamento = async (apt) => {
    setActionLoading(true);
    try {
      await appointmentService.update(apt.id, { status: "confirmed" });
      toast({ title: "Agendamento confirmado!", variant: "success" });
      await loadAppointments();
    } catch (e) {
      toast({ title: "Erro", variant: "error", description: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelDialog.appointment) return;
    setActionLoading(true);
    try {
      await appointmentService.update(cancelDialog.appointment.id, {
        status: "cancelled",
      });
      toast({ title: "Agendamento cancelado.", variant: "success" });
      setCancelDialog({ open: false, appointment: null });
      await loadAppointments();
    } catch (e) {
      toast({ title: "Erro", variant: "error", description: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const statusOptions = [
    { value: "", label: "Todos os status" },
    ...Object.values(APPOINTMENT_STATUS).map((s) => ({
      value: s.value,
      label: s.label,
    })),
  ];

  const getPaymentMethodLabel = (value) =>
    PAYMENT_METHODS.find((m) => m.value === value)?.label || value || "-";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="h-7 w-7 text-brand-600" />
              Agendamentos
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Lista completa de todos os agendamentos
            </p>
          </div>
          <Link href="/agendamentos/novo" passHref legacyBehavior>
            <Button icon={<Plus className="h-4 w-4" />}>
              Novo Agendamento
            </Button>
          </Link>
        </div>

        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
              <div className="md:col-span-4">
                <Input
                  placeholder="Buscar por cliente, serviço ou profissional..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              <div className="md:col-span-2">
                <Select
                  options={statusOptions}
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <Select
                  options={professionalOptions}
                  value={professionalId}
                  onChange={(e) => {
                    setProfessionalId(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <Select
                  options={clientOptions}
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <Select
                  options={serviceOptions}
                  value={serviceId}
                  onChange={(e) => {
                    setServiceId(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="mb-6">
              <DateRangePicker
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onChange={(r) => {
                  setDateRange(r);
                  setPage(1);
                }}
              />
            </div>

            {loading ? (
              <SkeletonTable rows={10} cols={10} />
            ) : appointments.length === 0 ? (
              <EmptyState
                icon={<CalendarCheck className="h-8 w-8 text-slate-400" strokeWidth={1.5} />}
                title="Sem agendamentos"
                description="Nenhum agendamento encontrado com os filtros selecionados."
                action={{
                  label: "Novo Agendamento",
                  onClick: () => router.push("/agendamentos/novo"),
                  icon: <Plus className="h-4 w-4" />,
                }}
              />
            ) : (
              <>
                <Table zebra colSpan={10}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Profissional</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell className="font-mono text-xs text-slate-500">
                          #{apt.id}
                        </TableCell>
                        <TableCell>{formatDateBR(apt.start)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="font-medium">
                            {formatTime(apt.start)}
                          </span>
                          <span className="text-slate-400 mx-1">-</span>
                          <span className="text-slate-600">
                            {formatTime(apt.end)}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {apt.clientName || "-"}
                        </TableCell>
                        <TableCell>{apt.serviceName || "-"}</TableCell>
                        <TableCell>
                          {apt.professionalName || "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-emerald-700">
                          {formatCurrencyBRL(apt.totalPrice)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              STATUS_BADGE_VARIANT[apt.status] || "default"
                            }
                          >
                            {APPOINTMENT_STATUS[apt.status]?.label ||
                              apt.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-xs">
                            <span
                              className={`font-semibold ${
                                apt.paid ? "text-emerald-700" : "text-amber-700"
                              }`}
                            >
                              {formatCurrencyBRL(apt.totalPrice)}
                            </span>
                            <span className="text-slate-500">
                              {apt.paid ? getPaymentMethodLabel(apt.paymentMethod) : "Pendente"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/agendamentos/${apt.id}`}
                              passHref
                              legacyBehavior
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Eye className="h-4 w-4" />}
                                aria-label="Ver detalhes"
                              />
                            </Link>
                            <Link
                              href={`/agendamentos/${apt.id}?edit=true`}
                              passHref
                              legacyBehavior
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Pencil className="h-4 w-4" />}
                                aria-label="Editar"
                              />
                            </Link>
                            {apt.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<CheckCircle2 className="h-4 w-4 text-blue-600" />}
                                aria-label="Confirmar"
                                onClick={() => confirmarAgendamento(apt)}
                              />
                            )}
                            {(apt.status === "pending" || apt.status === "confirmed") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<XCircle className="h-4 w-4 text-red-600" />}
                                aria-label="Cancelar"
                                onClick={() =>
                                  setCancelDialog({
                                    open: true,
                                    appointment: apt,
                                  })
                                }
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6">
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalCount={total}
                    onPageChange={setPage}
                  />
                </div>
              </>
            )}
          </CardBody>
        </Card>

        <DialogConfirm
          open={cancelDialog.open}
          onOpenChange={(o) => setCancelDialog({ ...cancelDialog, open: o })}
          title="Cancelar agendamento?"
          description={
            cancelDialog.appointment
              ? `Deseja cancelar o agendamento #${cancelDialog.appointment.id} de ${cancelDialog.appointment.clientName}?`
              : ""
          }
          confirmText="Sim, cancelar"
          variant="danger"
          onConfirm={handleConfirmCancel}
          loading={actionLoading}
        />
      </div>
    </AdminLayout>
  );
}
