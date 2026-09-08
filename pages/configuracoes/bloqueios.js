import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  CalendarOff,
  Plus,
  Trash2,
  List,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import Modal, { ModalHeader, ModalBody, ModalFooter, ModalTitle } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import DialogConfirm from "@/components/ui/DialogConfirm";
import { DAYS_OF_WEEK } from "@/utils/constants";
import { useToast } from "@/hooks/useToast";
import scheduleBlockService from "@/services/scheduleBlockService";
import professionalService from "@/services/professionalService";
import { formatDateBR } from "@/utils/format";

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}

export default function BloqueiosPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [bloqueios, setBloqueios] = useState([]);
  const [total, setTotal] = useState(0);
  const [profissionais, setProfissionais] = useState([]);
  const [calendarBlocks, setCalendarBlocks] = useState([]);

  const [profissionalFiltro, setProfissionalFiltro] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [activeTab, setActiveTab] = useState("lista");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [modalNovo, setModalNovo] = useState(false);
  const [form, setForm] = useState({
    type: "full_day",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    professionalId: "",
    reason: "feriado",
    notes: "",
  });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null });

  async function loadProfissionais() {
    try {
      const r = await professionalService.list({ limit: 100 });
      setProfissionais(r.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadBloqueios() {
    try {
      setLoading(true);
      const r = await scheduleBlockService.list({
        professionalId: profissionalFiltro || null,
        page,
        limit,
      });
      setBloqueios(r.data);
      setTotal(r.total);
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao carregar bloqueios.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function loadCalendar() {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    try {
      const data = await scheduleBlockService.listForCalendar({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        professionalId: profissionalFiltro || null,
      });
      setCalendarBlocks(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadProfissionais();
  }, []);

  useEffect(() => {
    loadBloqueios();
  }, [profissionalFiltro, page]);

  useEffect(() => {
    loadCalendar();
  }, [currentMonth, profissionalFiltro]);

  function resetForm() {
    setForm({
      type: "full_day",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      professionalId: "",
      reason: "feriado",
      notes: "",
    });
  }

  async function handleCriar() {
    if (!form.startDate) {
      toast({ title: "Atenção", description: "Informe a data.", variant: "warning" });
      return;
    }
    if (form.type === "time_range" && (!form.startTime || !form.endTime)) {
      toast({ title: "Atenção", description: "Informe horário de início e fim.", variant: "warning" });
      return;
    }
    if (form.type === "period" && !form.endDate) {
      toast({ title: "Atenção", description: "Informe a data final do período.", variant: "warning" });
      return;
    }
    try {
      const professionalName = form.professionalId
        ? profissionais.find((p) => p.id === Number(form.professionalId))?.name || "Todos"
        : "Todos";

      await scheduleBlockService.create({
        ...form,
        professionalId: form.professionalId ? Number(form.professionalId) : null,
        professionalName,
      });
      toast({ title: "Sucesso", description: "Bloqueio criado!", variant: "success" });
      setModalNovo(false);
      resetForm();
      loadBloqueios();
      loadCalendar();
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao criar bloqueio.", variant: "error" });
    }
  }

  function handleExcluir(item) {
    setConfirmDialog({ open: true, item });
  }

  async function confirmExcluir() {
    try {
      await scheduleBlockService.remove(confirmDialog.item.id);
      toast({ title: "Sucesso", description: "Bloqueio excluído!", variant: "success" });
      loadBloqueios();
      loadCalendar();
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao excluir bloqueio.", variant: "error" });
    }
  }

  const profissionalOptions = [
    { value: "", label: "Todos os profissionais" },
    { value: "all", label: "⬤ Geral / Agenda toda" },
    ...profissionais.map((p) => ({ value: String(p.id), label: p.name })),
  ];

  function getBlockInfoForDate(dateStr) {
    return calendarBlocks.filter((b) => {
      const bs = new Date(b.startDate).toISOString().split("T")[0];
      const be = new Date(b.endDate).toISOString().split("T")[0];
      return dateStr >= bs && dateStr <= be;
    });
  }

  function renderCalendar() {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const lastDate = new Date(y, m + 1, 0).getDate();
    const today = new Date().toISOString().split("T")[0];
    const monthLabel = currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`e-${i}`} className="h-28 rounded-lg bg-slate-50/50 border border-slate-100" />);
    }
    for (let d = 1; d <= lastDate; d++) {
      const date = new Date(y, m, d);
      const dateStr = date.toISOString().split("T")[0];
      const blocks = getBlockInfoForDate(dateStr);
      const isToday = dateStr === today;
      cells.push(
        <div
          key={d}
          className={`h-28 rounded-lg border p-2 overflow-hidden transition-colors ${
            blocks.length > 0
              ? "bg-red-50 border-red-200"
              : isToday
              ? "bg-brand-50 border-brand-200 ring-2 ring-brand-100"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className={`text-xs font-semibold mb-1 ${isToday ? "text-brand-700" : "text-slate-700"}`}>
            {d}
          </div>
          <div className="space-y-1">
            {blocks.slice(0, 2).map((b) => (
              <div
                key={b.id}
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium truncate ${
                  b.professionalId ? "bg-red-100 text-red-700" : "bg-red-500 text-white"
                }`}
                title={`${b.reasonLabel} - ${b.professionalName}`}
              >
                {b.reasonLabel}
              </div>
            ))}
            {blocks.length > 2 && (
              <div className="text-[10px] text-red-600 font-medium">+{blocks.length - 2} mais</div>
            )}
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<ChevronLeft className="h-4 w-4" />}
              onClick={() => setCurrentMonth(new Date(y, m - 1, 1))}
            />
            <h3 className="text-base font-semibold text-slate-900 capitalize w-48 text-center">
              {monthLabel}
            </h3>
            <Button
              variant="outline"
              size="sm"
              icon={<ChevronRight className="h-4 w-4" />}
              onClick={() => setCurrentMonth(new Date(y, m + 1, 1))}
            />
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-red-500"></span> Geral
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-red-100 border border-red-200"></span> Profissional
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-brand-50 ring-2 ring-brand-100 border border-brand-200"></span> Hoje
            </span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d.value} className="text-center text-xs font-semibold text-slate-500 uppercase py-2">
              {d.shortLabel}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cells}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarOff className="h-6 w-6 text-brand-600" />
            Bloqueios de Agenda e Feriados
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Gerencie dias indisponíveis, férias, feriados e horários bloqueados
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setModalNovo(true)}>
          Novo Bloqueio
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="lista" className="sm:max-w-md">
              <TabsList>
                <TabsTrigger value="lista" className="gap-2">
                  <List className="h-4 w-4" /> Lista
                </TabsTrigger>
                <TabsTrigger value="calendario" className="gap-2">
                  <CalendarDays className="h-4 w-4" /> Calendário
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="sm:max-w-xs w-full">
              <Select
                value={profissionalFiltro}
                onChange={(e) => {
                  setProfissionalFiltro(e.target.value);
                  setPage(1);
                }}
                options={profissionalOptions}
                leftIcon={<Users className="h-4 w-4" />}
              />
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="lista">
            <TabsContent value="lista">
              {loading ? (
                <SkeletonTable rows={5} cols={5} />
              ) : bloqueios.length === 0 ? (
                <EmptyState
                  icon={CalendarOff}
                  title="Nenhum bloqueio encontrado"
                  description="Clique em 'Novo Bloqueio' para cadastrar feriados, férias ou manutenções."
                  action={{
                    label: "Novo Bloqueio",
                    icon: <Plus className="h-4 w-4" />,
                    onClick: () => setModalNovo(true),
                  }}
                />
              ) : (
                <>
                  <Table zebra>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data / Período</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Profissional</TableHead>
                        <TableHead>Observações</TableHead>
                        <TableHead className="w-[80px] text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bloqueios.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell>
                            <div className="text-sm font-medium text-slate-900">
                              {b.startDate === b.endDate
                                ? formatDateBR(b.startDate)
                                : `${formatDateBR(b.startDate)}`}
                            </div>
                            {b.startDate !== b.endDate && (
                              <div className="text-xs text-slate-500">
                                até {formatDateBR(b.endDate)}
                              </div>
                            )}
                            {b.type === "time_range" && b.startTime && (
                              <div className="text-xs text-slate-600 mt-0.5">
                                {b.startTime} às {b.endTime}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="info">
                              {scheduleBlockService.getTypeLabel(b.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                b.reason === "feriado"
                                  ? "warning"
                                  : b.reason === "ferias"
                                  ? "danger"
                                  : "default"
                              }
                            >
                              {b.reasonLabel || scheduleBlockService.getReasonLabel(b.reason)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 text-sm ${
                              b.professionalId ? "text-slate-700" : "font-semibold text-brand-700"
                            }`}>
                              {!b.professionalId && (
                                <span className="inline-block w-2 h-2 rounded-full bg-brand-500" />
                              )}
                              {b.professionalName || "Todos"}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600 max-w-[220px] truncate">
                            {b.notes || "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="h-4 w-4" />}
                                onClick={() => handleExcluir(b)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-6">
                    <Pagination
                      page={page}
                      pageSize={limit}
                      totalCount={total}
                      onPageChange={setPage}
                    />
                  </div>
                </>
              )}
            </TabsContent>
            <TabsContent value="calendario">
              {renderCalendar()}
            </TabsContent>
          </Tabs>
        </CardBody>
      </Card>

      <Modal open={modalNovo} onClose={() => { setModalNovo(false); resetForm(); }} size="lg">
        <ModalHeader>
          <ModalTitle>Novo Bloqueio</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
              <div className="grid grid-cols-3 gap-2">
                {scheduleBlockService.getBlockTypes().map((t) => (
                  <label
                    key={t.value}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      form.type === t.value
                        ? "border-brand-400 bg-brand-50 text-brand-700 ring-2 ring-brand-100"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <input
                      type="radio"
                      className="h-4 w-4 text-brand-600"
                      checked={form.type === t.value}
                      onChange={() => setForm({ ...form, type: t.value })}
                    />
                    <span className="text-sm font-medium">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={form.type === "period" ? "Data início" : "Data"}
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
              {form.type === "period" && (
                <Input
                  label="Data fim"
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              )}
              {form.type === "time_range" && (
                <>
                  <Input
                    label="Horário início"
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  />
                  <Input
                    label="Horário fim"
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  />
                </>
              )}
            </div>

            <Select
              label="Profissional"
              value={form.professionalId}
              onChange={(e) => setForm({ ...form, professionalId: e.target.value })}
              options={[
                { value: "", label: "⬤ Geral / Todos (bloqueia agenda toda)" },
                ...profissionais.map((p) => ({ value: String(p.id), label: p.name })),
              ]}
              helperText="Geral bloqueia a agenda inteira. Selecione um profissional para bloqueio individual."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Motivo"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                options={scheduleBlockService.getBlockReasons()}
              />
            </div>

            <Input
              label="Observações"
              placeholder="Detalhes adicionais (opcional)..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setModalNovo(false); resetForm(); }}>
            Cancelar
          </Button>
          <Button onClick={handleCriar}>Criar Bloqueio</Button>
        </ModalFooter>
      </Modal>

      <DialogConfirm
        open={confirmDialog.open}
        onOpenChange={(o) => setConfirmDialog({ ...confirmDialog, open: o })}
        title="Excluir bloqueio?"
        description={`Deseja realmente excluir este bloqueio? "${confirmDialog.item?.reasonLabel || ""}" - ${confirmDialog.item?.startDate ? formatDateBR(confirmDialog.item.startDate) : ""}.`}
        confirmText="Excluir"
        variant="danger"
        onConfirm={confirmExcluir}
      />
    </div>
  );
}

BloqueiosPage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
