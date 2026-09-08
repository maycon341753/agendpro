import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Users,
  User,
  Mail,
  Phone,
  Scissors,
  Clock,
  CalendarOff,
  Trash2,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import Modal, { ModalHeader, ModalBody, ModalFooter, ModalTitle } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { DAYS_OF_WEEK } from "@/utils/constants";
import { useToast } from "@/hooks/useToast";
import professionalService from "@/services/professionalService";
import serviceService from "@/services/serviceService";
import scheduleBlockService from "@/services/scheduleBlockService";
import { formatCurrencyBRL, formatPhone, formatDateBR } from "@/utils/format";

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}

const ESPECIALIDADES = [
  { value: "Cabeleireiro(a)", label: "Cabeleireiro(a)" },
  { value: "Manicure", label: "Manicure" },
  { value: "Esteticista", label: "Esteticista" },
  { value: "Depilador(a)", label: "Depilador(a)" },
  { value: "Maquiador(a)", label: "Maquiador(a)" },
];

export default function EditarProfissionalPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allServices, setAllServices] = useState([]);
  const [activeTab, setActiveTab] = useState("dados");

  const [dados, setDados] = useState({
    name: "",
    avatar: "",
    role: "",
    phone: "",
    email: "",
    commissionType: "percentage",
    commissionValue: "30",
    status: "active",
  });
  const [errors, setErrors] = useState({});

  const [servicosSelecionados, setServicosSelecionados] = useState([]);

  const [horarios, setHorarios] = useState({
    0: { enabled: false, openTime: "", closeTime: "", breakStart: "", breakEnd: "" },
    1: { enabled: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
    2: { enabled: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
    3: { enabled: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
    4: { enabled: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
    5: { enabled: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
    6: { enabled: false, openTime: "", closeTime: "", breakStart: "", breakEnd: "" },
  });

  const [bloqueios, setBloqueios] = useState([]);
  const [modalBloqueio, setModalBloqueio] = useState(false);
  const [novoBloqueio, setNovoBloqueio] = useState({
    startDate: "",
    endDate: "",
    reason: "folga",
    notes: "",
  });

  async function loadServices() {
    try {
      const r = await serviceService.list({ limit: 100 });
      setAllServices(r.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadProfissional() {
    if (!id) return;
    try {
      setLoading(true);
      const p = await professionalService.get(id);
      setDados({
        name: p.name || "",
        avatar: p.avatar || "",
        role: p.role || "",
        phone: p.phone || "",
        email: p.email || "",
        commissionType: p.commissionType || "percentage",
        commissionValue: p.commissionValue != null ? String(p.commissionValue) : "30",
        status: p.status || "active",
      });
      setServicosSelecionados((p.services || []).map((s) => s.id));
      if (p.workHours) {
        setHorarios(p.workHours);
      }
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao carregar profissional.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (id) loadProfissional();
  }, [id]);

  function updateDados(field, value) {
    setDados((p) => ({ ...p, [field]: value }));
    if (errors[field]) {
      setErrors((e) => {
        const x = { ...e };
        delete x[field];
        return x;
      });
    }
  }

  function handlePhoneChange(field) {
    return (e) => {
      updateDados(field, formatPhone(e.target.value));
    };
  }

  function toggleServico(servId) {
    setServicosSelecionados((prev) =>
      prev.includes(servId) ? prev.filter((x) => x !== servId) : [...prev, servId]
    );
  }

  function toggleTodosServicos() {
    if (servicosSelecionados.length === allServices.length) {
      setServicosSelecionados([]);
    } else {
      setServicosSelecionados(allServices.map((s) => s.id));
    }
  }

  function updateHorario(day, field, value) {
    setHorarios((h) => ({
      ...h,
      [day]: { ...h[day], [field]: value },
    }));
  }

  function toggleDia(day) {
    setHorarios((h) => ({
      ...h,
      [day]: {
        ...h[day],
        enabled: !h[day].enabled,
      },
    }));
  }

  function handleAddBloqueio() {
    if (!novoBloqueio.startDate) {
      toast({ title: "Atenção", description: "Informe a data inicial.", variant: "warning" });
      return;
    }
    const end = novoBloqueio.endDate || novoBloqueio.startDate;
    const block = {
      id: Date.now(),
      startDate: novoBloqueio.startDate,
      endDate: end,
      reason: novoBloqueio.reason,
      reasonLabel: scheduleBlockService.getReasonLabel(novoBloqueio.reason),
      notes: novoBloqueio.notes,
    };
    setBloqueios((b) => [...b, block]);
    setNovoBloqueio({ startDate: "", endDate: "", reason: "folga", notes: "" });
    setModalBloqueio(false);
  }

  function removeBloqueio(blockId) {
    setBloqueios((b) => b.filter((x) => x.id !== blockId));
  }

  function validateDados() {
    const e = {};
    if (!dados.name.trim()) e.name = "Nome é obrigatório";
    if (!dados.role) e.role = "Especialidade é obrigatória";
    if (dados.commissionValue && Number(dados.commissionValue) < 0) e.commissionValue = "Valor inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validateDados() || !id) {
      setActiveTab("dados");
      return;
    }
    try {
      setSaving(true);
      const services = allServices
        .filter((s) => servicosSelecionados.includes(s.id))
        .map((s) => ({ id: s.id, name: s.name }));

      await professionalService.update(id, {
        ...dados,
        role: dados.role,
        avatar: dados.avatar.trim() || null,
        commissionValue: Number(dados.commissionValue) || 0,
        services,
        workHours: horarios,
        scheduleBlocks: bloqueios,
      });
      toast({ title: "Sucesso", description: "Profissional atualizado com sucesso!", variant: "success" });
      router.push("/profissionais");
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao atualizar profissional.", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link href="/profissionais" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Voltar para profissionais
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {loading ? <Skeleton className="h-6 w-40 inline-block" /> : "Editar Profissional"}
              </h1>
              <p className="text-sm text-slate-500">Atualize os dados do colaborador</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="space-y-6 py-4">
              <SkeletonText lines={5} />
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="dados">
              <TabsList>
                <TabsTrigger value="dados" className="gap-2">
                  <User className="h-4 w-4" /> Dados
                </TabsTrigger>
                <TabsTrigger value="servicos" className="gap-2">
                  <Scissors className="h-4 w-4" /> Serviços
                  {servicosSelecionados.length > 0 && (
                    <Badge variant="info" className="ml-1">{servicosSelecionados.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="horarios" className="gap-2">
                  <Clock className="h-4 w-4" /> Horários
                </TabsTrigger>
                <TabsTrigger value="bloqueios" className="gap-2">
                  <CalendarOff className="h-4 w-4" /> Bloqueios
                  {bloqueios.length > 0 && (
                    <Badge variant="danger" className="ml-1">{bloqueios.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dados">
                <div className="space-y-5 pt-2">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <Avatar
                        src={dados.avatar}
                        name={dados.name}
                        size="xl"
                        className="h-24 w-24 text-2xl ring-4 ring-brand-50"
                      />
                      <span className="text-xs text-slate-500">Foto do profissional</span>
                    </div>
                    <div className="flex-1 w-full space-y-5">
                      <Input
                        label="Nome completo"
                        required
                        placeholder="Ex: Ana Silva"
                        value={dados.name}
                        onChange={(e) => updateDados("name", e.target.value)}
                        error={errors.name}
                      />
                      <Input
                        label="URL da foto"
                        placeholder="https://..."
                        value={dados.avatar}
                        onChange={(e) => updateDados("avatar", e.target.value)}
                        helperText="Opcional"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Select
                      label="Especialidade"
                      required
                      value={dados.role}
                      onChange={(e) => updateDados("role", e.target.value)}
                      options={[{ value: "", label: "Selecione..." }, ...ESPECIALIDADES]}
                      error={errors.role}
                    />
                    <Input
                      label="Telefone"
                      leftIcon={<Phone className="h-4 w-4" />}
                      placeholder="(00) 00000-0000"
                      value={dados.phone}
                      onChange={handlePhoneChange("phone")}
                    />
                    <Input
                      label="E-mail"
                      type="email"
                      leftIcon={<Mail className="h-4 w-4" />}
                      placeholder="nome@email.com"
                      value={dados.email}
                      onChange={(e) => updateDados("email", e.target.value)}
                    />
                    <Select
                      label="Status"
                      value={dados.status}
                      onChange={(e) => updateDados("status", e.target.value)}
                      options={[
                        { value: "active", label: "Ativo" },
                        { value: "inactive", label: "Inativo" },
                      ]}
                    />
                  </div>

                  <div className="border-t border-slate-200 pt-5">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">Comissão</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Select
                        label="Tipo de comissão"
                        value={dados.commissionType}
                        onChange={(e) => updateDados("commissionType", e.target.value)}
                        options={[
                          { value: "percentage", label: "Percentual (%)" },
                          { value: "fixed", label: "Valor fixo (R$)" },
                        ]}
                      />
                      <Input
                        label="Valor da comissão"
                        type="number"
                        min="0"
                        step={dados.commissionType === "percentage" ? "1" : "0.01"}
                        placeholder={dados.commissionType === "percentage" ? "30" : "50,00"}
                        value={dados.commissionValue}
                        onChange={(e) => updateDados("commissionValue", e.target.value)}
                        leftIcon={
                          <span className="text-xs text-slate-500 font-medium">
                            {dados.commissionType === "percentage" ? "%" : "R$"}
                          </span>
                        }
                        error={errors.commissionValue}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="servicos">
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Selecione os serviços que este profissional realiza
                    </p>
                    <Button variant="ghost" size="sm" onClick={toggleTodosServicos}>
                      {servicosSelecionados.length === allServices.length ? "Desmarcar todos" : "Marcar todos"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                    {allServices.length === 0 ? (
                      <div className="col-span-2 py-8 text-center text-sm text-slate-500">
                        Nenhum serviço cadastrado ainda.
                      </div>
                    ) : (
                      allServices.map((s) => {
                        const checked = servicosSelecionados.includes(s.id);
                        return (
                          <label
                            key={s.id}
                            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                              checked
                                ? "border-brand-400 bg-brand-50/50 ring-2 ring-brand-100"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                              checked={checked}
                              onChange={() => toggleServico(s.id)}
                            />
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <Avatar
                                src={s.image}
                                name={s.name}
                                size="md"
                                style={s.color ? { backgroundColor: s.color, color: "#fff" } : {}}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-slate-900 text-sm">{s.name}</div>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <Badge variant="info" className="text-[10px]">{s.category}</Badge>
                                  <span className="text-xs text-slate-500">{s.duration} min</span>
                                  <span className="text-xs font-medium text-slate-700">
                                    {formatCurrencyBRL(s.price)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="horarios">
                <div className="space-y-3 pt-2">
                  <p className="text-sm text-slate-600 mb-4">
                    Defina os horários de atendimento por dia da semana
                  </p>
                  <div className="space-y-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const h = horarios[day.value];
                      return (
                        <div
                          key={day.value}
                          className={`rounded-lg border p-4 transition-colors ${
                            h.enabled ? "border-brand-200 bg-brand-50/30" : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="flex items-center gap-3 min-w-[180px] cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                checked={h.enabled}
                                onChange={() => toggleDia(day.value)}
                              />
                              <span className={`font-medium text-sm ${h.enabled ? "text-slate-900" : "text-slate-500"}`}>
                                {day.label}
                              </span>
                            </label>
                            {h.enabled ? (
                              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <Input
                                  label="Abertura"
                                  type="time"
                                  size="sm"
                                  value={h.openTime}
                                  onChange={(e) => updateHorario(day.value, "openTime", e.target.value)}
                                />
                                <Input
                                  label="Fechamento"
                                  type="time"
                                  size="sm"
                                  value={h.closeTime}
                                  onChange={(e) => updateHorario(day.value, "closeTime", e.target.value)}
                                />
                                <Input
                                  label="Intervalo início"
                                  type="time"
                                  size="sm"
                                  value={h.breakStart}
                                  onChange={(e) => updateHorario(day.value, "breakStart", e.target.value)}
                                />
                                <Input
                                  label="Intervalo fim"
                                  type="time"
                                  size="sm"
                                  value={h.breakEnd}
                                  onChange={(e) => updateHorario(day.value, "breakEnd", e.target.value)}
                                />
                              </div>
                            ) : (
                              <div className="flex-1 text-sm text-slate-400 italic px-2">
                                Fechado
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bloqueios">
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Folgas, férias e indisponibilidades pessoais
                    </p>
                    <Button
                      size="sm"
                      icon={<Plus className="h-4 w-4" />}
                      onClick={() => setModalBloqueio(true)}
                    >
                      Adicionar
                    </Button>
                  </div>

                  {bloqueios.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center">
                      <CalendarOff className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                      <p className="text-sm text-slate-500">Nenhum bloqueio cadastrado</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Clique em &quot;Adicionar&quot; para cadastrar folgas ou férias
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Período</TableHead>
                            <TableHead>Motivo</TableHead>
                            <TableHead>Observações</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bloqueios.map((b) => (
                            <TableRow key={b.id}>
                              <TableCell className="text-sm">
                                {b.startDate === b.endDate
                                  ? formatDateBR(b.startDate)
                                  : `${formatDateBR(b.startDate)} a ${formatDateBR(b.endDate)}`}
                              </TableCell>
                              <TableCell>
                                <Badge variant={b.reason === "ferias" ? "warning" : "info"}>
                                  {b.reasonLabel}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {b.notes || "—"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={<Trash2 className="h-4 w-4" />}
                                  onClick={() => removeBloqueio(b.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-slate-200">
            <Link href="/profissionais" passHref legacyBehavior>
              <Button asChild variant="outline">
                <a>Cancelar</a>
              </Button>
            </Link>
            <Button loading={saving || loading} icon={<Save className="h-4 w-4" />} onClick={handleSubmit}>
              Salvar alterações
            </Button>
          </div>
        </CardBody>
      </Card>

      <Modal open={modalBloqueio} onClose={() => setModalBloqueio(false)} size="md">
        <ModalHeader>
          <ModalTitle>Novo Bloqueio</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Data início"
                type="date"
                required
                value={novoBloqueio.startDate}
                onChange={(e) => setNovoBloqueio({ ...novoBloqueio, startDate: e.target.value })}
              />
              <Input
                label="Data fim"
                type="date"
                helperText="Opcional para dia único"
                value={novoBloqueio.endDate}
                onChange={(e) => setNovoBloqueio({ ...novoBloqueio, endDate: e.target.value })}
              />
            </div>
            <Select
              label="Motivo"
              value={novoBloqueio.reason}
              onChange={(e) => setNovoBloqueio({ ...novoBloqueio, reason: e.target.value })}
              options={scheduleBlockService.getBlockReasons()}
            />
            <Input
              label="Observações"
              placeholder="Opcional..."
              value={novoBloqueio.notes}
              onChange={(e) => setNovoBloqueio({ ...novoBloqueio, notes: e.target.value })}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalBloqueio(false)}>Cancelar</Button>
          <Button onClick={handleAddBloqueio}>Adicionar</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

EditarProfissionalPage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
