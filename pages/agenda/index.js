import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/Modal";
import DialogConfirm from "@/components/ui/DialogConfirm";
import { Skeleton } from "@/components/ui/Skeleton";
import Alert from "@/components/ui/Alert";
import { useToast } from "@/hooks/useToast";
import appointmentService from "@/services/appointmentService";
import { APPOINTMENT_STATUS, DAYS_OF_WEEK } from "@/utils/constants";
import {
  formatCurrencyBRL,
  formatDateBR,
  formatTime,
} from "@/utils/format";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  LayoutGrid,
  CalendarRange,
  MoreVertical,
  Pencil,
  CheckCircle2,
  PlayCircle,
  XCircle,
  RotateCcw,
  UserX,
  Eye,
  UserPlus,
} from "lucide-react";

const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-50">
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  </div>
);

const START_HOUR = 8;
const END_HOUR = 20;
const SLOT_MINUTES = 30;
const ROW_HEIGHT = 60;

const STATUS_STYLES = {
  pending: "bg-amber-50 border-amber-300 text-amber-900",
  confirmed: "bg-blue-50 border-blue-300 text-blue-900",
  in_progress: "bg-purple-50 border-purple-300 text-purple-900",
  completed: "bg-emerald-50 border-emerald-300 text-emerald-900",
  cancelled: "bg-slate-100 border-slate-300 text-slate-500 line-through",
  no_show: "bg-red-50 border-red-300 text-red-900",
};

const STATUS_BADGE_VARIANT = {
  pending: "warning",
  confirmed: "info",
  in_progress: "default",
  completed: "success",
  cancelled: "muted",
  no_show: "danger",
};

const PROFESSIONAUX = [
  { value: "", label: "Todos os profissionais" },
  { value: 1, label: "Ana Silva" },
  { value: 2, label: "Juliana Costa" },
  { value: 3, label: "Fernanda Lima" },
];

function generateSampleAppointments(baseDate) {
  const sample = [];
  const nomes = [
    "Maria Oliveira",
    "João Santos",
    "Ana Paula",
    "Carlos Eduardo",
    "Juliana Rocha",
    "Fernanda Souza",
    "Lucas Martins",
    "Camila Ribeiro",
  ];
  const servicos = [
    "Corte Feminino",
    "Limpeza de Pele",
    "Massagem Relaxante",
    "Depilação",
    "Design de Sobrancelhas",
    "Coloração",
    "Hidratação Capilar",
  ];
  const profissionais = ["Ana Silva", "Juliana Costa", "Fernanda Lima"];
  const statusKeys = Object.keys(APPOINTMENT_STATUS);

  for (let i = 0; i < 12; i++) {
    const dayOffset = Math.floor(Math.random() * 7) - 3;
    const hours = START_HOUR + Math.floor(Math.random() * (END_HOUR - START_HOUR - 1));
    const mins = [0, 30][Math.floor(Math.random() * 2)];
    const duration = [30, 60, 90][Math.floor(Math.random() * 3)];
    const status = statusKeys[Math.floor(Math.random() * statusKeys.length)];

    const start = new Date(baseDate);
    start.setDate(start.getDate() + dayOffset);
    start.setHours(hours, mins, 0, 0);
    const end = new Date(start.getTime() + duration * 60000);

    sample.push({
      id: 100 + i,
      clientId: 1 + i,
      clientName: nomes[i % nomes.length],
      professionalId: (i % 3) + 1,
      professionalName: profissionais[i % profissionais.length],
      serviceId: i,
      serviceName: servicos[i % servicos.length],
      start: start.toISOString(),
      end: end.toISOString(),
      status,
      notes: "",
      totalPrice: [80, 120, 150, 60, 45, 200, 90][i % 7],
      paymentMethod: "pix",
      paid: Math.random() > 0.4,
    });
  }
  return sample;
}

function getMinutesFromMidnight(date) {
  return date.getHours() * 60 + date.getMinutes();
}

function startOfDay(d) {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function startOfWeek(d) {
  const n = new Date(d);
  const day = n.getDay();
  const diff = (day + 6) % 7;
  n.setDate(n.getDate() - diff);
  n.setHours(0, 0, 0, 0);
  return n;
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function getMonthGrid(date) {
  const first = startOfMonth(date);
  const last = endOfMonth(date);
  const gridStart = startOfWeek(first);
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i);
    cells.push({
      date: d,
      inMonth: d.getMonth() === date.getMonth(),
    });
  }
  return cells;
}

export default function AgendaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [view, setView] = useState("day");
  const [cursorDate, setCursorDate] = useState(new Date());
  const [professionalFilter, setProfessionalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSlot, setCreateSlot] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    confirmText: "",
    onConfirm: null,
    variant: "danger",
  });
  const [actionMenu, setActionMenu] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await appointmentService.list({ page: 1, limit: 200 });
        let list = res.data || [];
        if (list.length === 0) {
          list = generateSampleAppointments(today);
        }
        setAppointments(list);
      } catch (e) {
        setAppointments(generateSampleAppointments(today));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (professionalFilter && String(a.professionalId) !== String(professionalFilter)) {
        return false;
      }
      if (statusFilter && a.status !== statusFilter) return false;
      return true;
    });
  }, [appointments, professionalFilter, statusFilter]);

  const statusOptions = [
    { value: "", label: "Todos os status" },
    ...Object.values(APPOINTMENT_STATUS).map((s) => ({
      value: s.value,
      label: s.label,
    })),
  ];

  const navigatePrevious = () => {
    if (view === "day") setCursorDate((d) => addDays(d, -1));
    else if (view === "week") setCursorDate((d) => addDays(d, -7));
    else setCursorDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const navigateNext = () => {
    if (view === "day") setCursorDate((d) => addDays(d, 1));
    else if (view === "week") setCursorDate((d) => addDays(d, 7));
    else setCursorDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const goToday = () => setCursorDate(new Date());

  const handleSlotClick = (date, hourMinutes) => {
    const d = new Date(date);
    d.setHours(
      Math.floor(hourMinutes / 60),
      hourMinutes % 60,
      0,
      0
    );
    setCreateSlot(d);
    setCreateModalOpen(true);
  };

  const openDetail = (apt) => {
    setSelectedAppointment(apt);
    setDetailModalOpen(true);
  };

  const changeStatus = async (aptId, newStatus, successMessage) => {
    setActionLoading(true);
    try {
      await appointmentService.update(aptId, { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === aptId ? { ...a, status: newStatus } : a
        )
      );
      toast({ title: "Sucesso!", description: successMessage, variant: "success" });
      setDetailModalOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível concluir a ação.",
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const confirmCancel = (apt) => {
    setConfirmDialog({
      open: true,
      title: "Cancelar agendamento?",
      description: `Deseja realmente cancelar o agendamento de ${apt.clientName}?`,
      confirmText: "Sim, cancelar",
      variant: "danger",
      onConfirm: async () => {
        await changeStatus(apt.id, "cancelled", "Agendamento cancelado com sucesso.");
      },
    });
  };

  const handleDragStart = (e, apt) => {
    e.dataTransfer.setData("text/plain", String(apt.id));
    console.log("[drag] start", apt.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, date, hourMinutes) => {
    e.preventDefault();
    const aptId = e.dataTransfer.getData("text/plain");
    console.log("[drag] drop", aptId, date, hourMinutes);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-brand-600" />
            Agenda Profissional
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie os horários e agendamentos
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Tabs value={view} onValueChange={setView} className="w-auto">
                <TabsList>
                  <TabsTrigger value="day">
                    <CalendarIcon className="h-4 w-4 mr-2 hidden sm:inline" />
                    DIA
                  </TabsTrigger>
                  <TabsTrigger value="week">
                    <LayoutGrid className="h-4 w-4 mr-2 hidden sm:inline" />
                    SEMANA
                  </TabsTrigger>
                  <TabsTrigger value="month" className="hidden md:inline-flex">
                    <CalendarRange className="h-4 w-4 mr-2 hidden sm:inline" />
                    MÊS
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardBody>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigatePrevious}
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToday}
                  className="min-w-[72px]"
                >
                  Hoje
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateNext}
                  aria-label="Próximo"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="ml-3 hidden md:block">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {view === "day" && formatDateBR(cursorDate)}
                    {view === "week" &&
                      `${formatDateBR(startOfWeek(cursorDate))} - ${formatDateBR(
                        addDays(startOfWeek(cursorDate), 6)
                      )}`}
                    {view === "month" &&
                      cursorDate.toLocaleString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}
                  </h2>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 md:ml-auto md:max-w-lg">
                <Select
                  options={PROFESSIONAUX}
                  value={professionalFilter}
                  onChange={(e) => setProfessionalFilter(e.target.value)}
                />
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <Tabs value={view} onValueChange={setView}>
                <TabsContent value="day">
                  <DayView
                    date={cursorDate}
                    appointments={filteredAppointments}
                    onSlotClick={handleSlotClick}
                    onAppointmentClick={openDetail}
                    showProfessional={!professionalFilter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                </TabsContent>

                <TabsContent value="week">
                  <WeekView
                    weekStart={startOfWeek(cursorDate)}
                    appointments={filteredAppointments}
                    onSlotClick={handleSlotClick}
                    onAppointmentClick={openDetail}
                    showProfessional={!professionalFilter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                </TabsContent>

                <TabsContent value="month">
                  <MonthView
                    monthDate={cursorDate}
                    appointments={filteredAppointments}
                    onDayClick={(date) => {
                      setCursorDate(date);
                      setView("day");
                    }}
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardBody>
        </Card>

        <CreateAppointmentModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          slotDate={createSlot}
          onCreated={() => {
            setCreateModalOpen(false);
            toast({
              title: "Agendamento criado",
              variant: "success",
            });
          }}
        />

        <AppointmentDetailModal
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          appointment={selectedAppointment}
          actionLoading={actionLoading}
          onConfirmar={(apt) =>
            changeStatus(apt.id, "confirmed", "Agendamento confirmado.")
          }
          onIniciar={(apt) =>
            changeStatus(apt.id, "in_progress", "Atendimento em andamento.")
          }
          onConcluir={(apt) =>
            changeStatus(apt.id, "completed", "Atendimento concluído.")
          }
          onReagendar={(apt) => {
            router.push(`/agendamentos/${apt.id}`);
            setDetailModalOpen(false);
          }}
          onCancelar={(apt) => confirmCancel(apt)}
          onNoShow={(apt) =>
            changeStatus(apt.id, "no_show", "Marcado como não compareceu.")
          }
          onEditar={(apt) => {
            router.push(`/agendamentos/${apt.id}`);
            setDetailModalOpen(false);
          }}
        />

        <DialogConfirm
          open={confirmDialog.open}
          onOpenChange={(o) => setConfirmDialog({ ...confirmDialog, open: o })}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          loading={actionLoading}
        />
      </div>
    </AdminLayout>
  );
}

function DayView({
  date,
  appointments,
  onSlotClick,
  onAppointmentClick,
  showProfessional,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const startMin = START_HOUR * 60;
  const endMin = END_HOUR * 60;
  const slots = [];
  for (let m = startMin; m < endMin; m += SLOT_MINUTES) {
    slots.push(m);
  }

  const dayAppointments = appointments.filter((a) =>
    isSameDay(new Date(a.start), date)
  );

  return (
    <div className="relative">
      <div className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide pl-20 md:hidden">
        {date.toLocaleString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
        })}
      </div>
      <div className="relative border border-slate-200 rounded-lg bg-white overflow-hidden">
        {slots.map((min, idx) => {
          const isNow = isSameDay(date, new Date()) &&
            min === Math.floor((new Date().getHours() * 60 + new Date().getMinutes()) / SLOT_MINUTES) * SLOT_MINUTES;
          return (
            <div
              key={min}
              className={`relative border-b border-dashed border-slate-200 last:border-0 ${
                idx % 2 === 1 ? "bg-slate-50/40" : ""
              } ${isNow ? "bg-brand-50/30" : ""}`}
              style={{ height: `${ROW_HEIGHT}px` }}
              onClick={() => onSlotClick(date, min)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, date, min)}
            >
              <div className="absolute left-0 top-0 w-16 md:w-20 h-full flex items-start justify-end pr-2 pt-1 text-xs font-medium text-slate-400 select-none pointer-events-none border-r border-slate-200 bg-white/80">
                {String(Math.floor(min / 60)).padStart(2, "0")}:
                {String(min % 60).padStart(2, "0")}
              </div>
            </div>
          );
        })}

        <div className="absolute top-0 left-16 md:left-20 right-0 h-full pointer-events-none">
          {dayAppointments.map((apt) => {
            const start = new Date(apt.start);
            const end = new Date(apt.end);
            const top =
              ((getMinutesFromMidnight(start) - startMin) / SLOT_MINUTES) *
              ROW_HEIGHT;
            const durationMin =
              (end.getTime() - start.getTime()) / 60000;
            const height = Math.max(
              (durationMin / SLOT_MINUTES) * ROW_HEIGHT - 2,
              40
            );
            return (
              <AppointmentBlock
                key={apt.id}
                apt={apt}
                style={{ top, height }}
                onClick={() => onAppointmentClick(apt)}
                showProfessional={showProfessional}
                onDragStart={onDragStart}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeekView({
  weekStart,
  appointments,
  onSlotClick,
  onAppointmentClick,
  showProfessional,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const startMin = START_HOUR * 60;
  const endMin = END_HOUR * 60;
  const slots = [];
  for (let m = startMin; m < endMin; m += SLOT_MINUTES) {
    slots.push(m);
  }

  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(weekStart, i));
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50/60 rounded-t-lg">
          <div className="p-3 text-xs font-semibold text-slate-400 text-center">
            Horário
          </div>
          {days.map((d, i) => {
            const isToday = isSameDay(d, new Date());
            return (
              <div
                key={i}
                className={`p-3 text-center border-l border-slate-200 ${
                  isToday ? "bg-brand-50/50" : ""
                }`}
              >
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  {DAYS_OF_WEEK[(d.getDay() + 6) % 7 === 6 ? 0 : ((d.getDay() + 6) % 7) + 1]?.shortLabel ||
                    DAYS_OF_WEEK[d.getDay()]?.shortLabel}
                </div>
                <div
                  className={`text-lg font-bold mt-0.5 ${
                    isToday ? "text-brand-600" : "text-slate-900"
                  }`}
                >
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {days.map((day, dayIdx) => (
          <div key={dayIdx} className="hidden">
            {day.toISOString()}
          </div>
        ))}

        <div className="relative">
          <div className="grid grid-cols-8 border border-t-0 border-slate-200 rounded-b-lg bg-white">
            <div className="border-r border-slate-200">
              {slots.map((min) => (
                <div
                  key={min}
                  className="border-b border-slate-100 last:border-0 flex items-start justify-end pr-2 pt-1 text-[11px] font-medium text-slate-400"
                  style={{ height: `${ROW_HEIGHT}px` }}
                >
                  {String(Math.floor(min / 60)).padStart(2, "0")}:
                  {String(min % 60).padStart(2, "0")}
                </div>
              ))}
            </div>

            {days.map((day, colIdx) => {
              const dayAppts = appointments.filter((a) =>
                isSameDay(new Date(a.start), day)
              );
              return (
                <div
                  key={colIdx}
                  className="relative border-r border-slate-200 last:border-r-0"
                >
                  {slots.map((min, slotIdx) => (
                    <div
                      key={`slot-${colIdx}-${min}`}
                      className={`border-b border-dashed border-slate-200 last:border-0 cursor-pointer hover:bg-brand-50/20 transition-colors ${
                        slotIdx % 2 === 1 ? "bg-slate-50/30" : ""
                      }`}
                      style={{ height: `${ROW_HEIGHT}px` }}
                      onClick={() => onSlotClick(day, min)}
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, day, min)}
                    />
                  ))}
                  <div className="absolute top-0 left-0 right-0 h-full pointer-events-none">
                    {dayAppts.map((apt) => {
                      const start = new Date(apt.start);
                      const end = new Date(apt.end);
                      const top =
                        ((getMinutesFromMidnight(start) - startMin) /
                          SLOT_MINUTES) *
                        ROW_HEIGHT;
                      const durationMin =
                        (end.getTime() - start.getTime()) / 60000;
                      const height = Math.max(
                        (durationMin / SLOT_MINUTES) * ROW_HEIGHT - 2,
                        36
                      );
                      return (
                        <AppointmentBlock
                          key={apt.id}
                          apt={apt}
                          compact
                          style={{ top, height }}
                          onClick={() => onAppointmentClick(apt)}
                          showProfessional={showProfessional}
                          onDragStart={onDragStart}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthView({ monthDate, appointments, onDayClick }) {
  const cells = getMonthGrid(monthDate);

  return (
    <div>
      <div className="grid grid-cols-7 gap-0 border border-slate-200 rounded-lg overflow-hidden">
        {DAYS_OF_WEEK.filter((_, i) => i > 0).concat([DAYS_OF_WEEK[0]]).map((d) => (
          <div
            key={d.value}
            className="bg-slate-50 p-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200"
          >
            {d.shortLabel}
          </div>
        ))}

        {cells.map((cell, idx) => {
          const { date, inMonth } = cell;
          const dayAppts = appointments.filter((a) =>
            isSameDay(new Date(a.start), date)
          );
          const confirmedCount = dayAppts.filter(
            (a) => a.status === "confirmed" || a.status === "in_progress" || a.status === "completed"
          ).length;
          const pendingCount = dayAppts.filter(
            (a) => a.status === "pending"
          ).length;
          const isToday = isSameDay(date, new Date());

          return (
            <button
              key={idx}
              onClick={() => onDayClick(date)}
              className={`relative min-h-[100px] md:min-h-[130px] border-b border-r border-slate-200 p-2 text-left transition-colors hover:bg-brand-50/30 ${
                idx % 7 === 6 ? "border-r-0" : ""
              } ${!inMonth ? "bg-slate-50/60 text-slate-400" : "bg-white"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`inline-flex items-center justify-center text-sm font-semibold w-7 h-7 rounded-full ${
                    isToday
                      ? "bg-brand-600 text-white"
                      : inMonth
                      ? "text-slate-900"
                      : "text-slate-400"
                  }`}
                >
                  {date.getDate()}
                </span>
                <div className="flex flex-col gap-0.5">
                  {confirmedCount > 0 && (
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">
                      {confirmedCount} confirm.
                    </Badge>
                  )}
                  {pendingCount > 0 && (
                    <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                      {pendingCount} pend.
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1 mt-1 hidden lg:block">
                {dayAppts.slice(0, 2).map((apt) => (
                  <div
                    key={apt.id}
                    className={`text-[11px] px-1.5 py-1 rounded border-l-2 truncate ${STATUS_STYLES[apt.status]}`}
                  >
                    <span className="font-semibold">
                      {formatTime(apt.start)}
                    </span>{" "}
                    <span className="opacity-80">{apt.clientName}</span>
                  </div>
                ))}
                {dayAppts.length > 2 && (
                  <div className="text-[11px] text-slate-500 px-1.5">
                    +{dayAppts.length - 2} mais
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AppointmentBlock({
  apt,
  style,
  onClick,
  showProfessional,
  compact,
  onDragStart,
}) {
  const status = APPOINTMENT_STATUS[apt.status] || APPOINTMENT_STATUS.pending;
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, apt)}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`absolute left-1 right-1 rounded-md border-l-4 border shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] pointer-events-auto ${
        STATUS_STYLES[apt.status]
      }`}
      style={style}
    >
      <div className="p-2 h-full flex flex-col justify-between">
        <div className={compact ? "space-y-0" : "space-y-0.5"}>
          <div className="flex items-center justify-between gap-1">
            <span className={`font-bold ${compact ? "text-[11px]" : "text-xs"}`}>
              {formatTime(apt.start)} - {formatTime(apt.end)}
            </span>
            <Badge
              variant={STATUS_BADGE_VARIANT[apt.status] || "default"}
              className="text-[10px] px-1.5 py-0"
            >
              {status.label}
            </Badge>
          </div>
          <div className={`font-semibold truncate ${compact ? "text-[11px]" : "text-xs"}`}>
            {apt.clientName}
          </div>
          {!compact && (
            <div className="text-[11px] opacity-90 truncate">
              {apt.serviceName}
            </div>
          )}
          {!compact && showProfessional && (
            <div className="text-[11px] opacity-80 truncate">
              {apt.professionalName}
            </div>
          )}
        </div>
        {!compact && (
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-black/5">
            <span className="text-[11px] font-semibold">
              {formatCurrencyBRL(apt.totalPrice)}
            </span>
            <MoreVertical className="h-3.5 w-3.5 opacity-60" />
          </div>
        )}
      </div>
    </div>
  );
}

function CreateAppointmentModal({ open, onClose, slotDate, onCreated }) {
  const router = useRouter();
  const handleCreate = () => {
    const params = new URLSearchParams();
    if (slotDate) {
      params.set("date", slotDate.toISOString().split("T")[0]);
      const h = String(slotDate.getHours()).padStart(2, "0");
      const m = String(slotDate.getMinutes()).padStart(2, "0");
      params.set("time", `${h}:${m}`);
    }
    router.push(`/agendamentos/novo${params.toString() ? "?" + params.toString() : ""}`);
  };
  return (
    <Modal open={open} onClose={onClose} size="md">
      <ModalHeader>
        <ModalTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-brand-600" />
          Novo Agendamento
        </ModalTitle>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          {slotDate && (
            <Alert variant="info">
              <div>
                <strong>Horário selecionado:</strong>
                <div className="mt-1">
                  {formatDateBR(slotDate)} às {formatTime(slotDate)}
                </div>
              </div>
            </Alert>
          )}
          <p className="text-sm text-slate-600">
            Você será redirecionado para o formulário completo de agendamento,
            onde poderá selecionar cliente, serviço e profissional.
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleCreate} icon={<UserPlus className="h-4 w-4" />}>
          Continuar
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function AppointmentDetailModal({
  open,
  onClose,
  appointment,
  actionLoading,
  onConfirmar,
  onIniciar,
  onConcluir,
  onReagendar,
  onCancelar,
  onNoShow,
  onEditar,
}) {
  const [menuOpen, setMenuOpen] = useState(null);
  if (!appointment) return null;

  const status = APPOINTMENT_STATUS[appointment.status];
  const start = new Date(appointment.start);
  const end = new Date(appointment.end);

  const canConfirm = ["pending"].includes(appointment.status);
  const canStart = ["confirmed", "pending"].includes(appointment.status);
  const canComplete = ["in_progress", "confirmed"].includes(appointment.status);
  const canCancel = ["pending", "confirmed", "in_progress"].includes(
    appointment.status
  );
  const canNoShow = ["pending", "confirmed"].includes(appointment.status);

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <ModalHeader>
        <ModalTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-brand-600" />
          Detalhes do Agendamento
        </ModalTitle>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 pb-5 border-b border-slate-200">
            <Avatar size="lg" name={appointment.clientName} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-slate-900">
                  {appointment.clientName}
                </h3>
                <Badge
                  variant={STATUS_BADGE_VARIANT[appointment.status] || "default"}
                >
                  {status?.label || appointment.status}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-500">Serviço:</span>{" "}
                  <span className="font-medium">{appointment.serviceName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Profissional:</span>{" "}
                  <span className="font-medium">
                    {appointment.professionalName || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Data:</span>{" "}
                  <span className="font-medium">{formatDateBR(start)}</span>
                </div>
                <div>
                  <span className="text-slate-500">Horário:</span>{" "}
                  <span className="font-medium">
                    {formatTime(start)} - {formatTime(end)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Valor:</span>{" "}
                  <span className="font-semibold text-emerald-700">
                    {formatCurrencyBRL(appointment.totalPrice)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Pagamento:</span>{" "}
                  <Badge
                    variant={appointment.paid ? "success" : "warning"}
                  >
                    {appointment.paid ? "Pago" : "Pendente"}
                    {appointment.paymentMethod
                      ? ` (${appointment.paymentMethod})`
                      : ""}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {appointment.notes && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Observações
              </p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-200">
                {appointment.notes}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => onEditar(appointment)}
            >
              Editar
            </Button>
            {canConfirm && (
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircle2 className="h-4 w-4" />}
                disabled={actionLoading}
                onClick={() => onConfirmar(appointment)}
              >
                Confirmar
              </Button>
            )}
            {canStart && (
              <Button
                variant="primary"
                size="sm"
                icon={<PlayCircle className="h-4 w-4" />}
                disabled={actionLoading}
                onClick={() => onIniciar(appointment)}
              >
                Em Atendimento
              </Button>
            )}
            {canComplete && (
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircle2 className="h-4 w-4" />}
                disabled={actionLoading}
                onClick={() => onConcluir(appointment)}
              >
                Concluir
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw className="h-4 w-4" />}
              onClick={() => onReagendar(appointment)}
            >
              Reagendar
            </Button>
            {canNoShow && (
              <Button
                variant="outline"
                size="sm"
                icon={<UserX className="h-4 w-4" />}
                disabled={actionLoading}
                onClick={() => onNoShow(appointment)}
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
                onClick={() => onCancelar(appointment)}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
