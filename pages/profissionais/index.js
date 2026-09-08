import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Users, Plus, Search, Pencil, Archive, Restore, FolderOpen, Phone, Mail, Percent } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import DialogConfirm from "@/components/ui/DialogConfirm";
import { useToast } from "@/hooks/useToast";
import professionalService from "@/services/professionalService";
import serviceService from "@/services/serviceService";
import { formatCurrencyBRL, formatPhone } from "@/utils/format";

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}

const ESPECIALIDADES = [
  { value: "Cabeleireira", label: "Cabeleireiro(a)" },
  { value: "Manicure", label: "Manicure" },
  { value: "Esteticista", label: "Esteticista" },
  { value: "Depiladora", label: "Depilador(a)" },
  { value: "Maquiadora", label: "Maquiador(a)" },
];

export default function ProfissionaisPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profissionais, setProfissionais] = useState([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [especialidadeFiltro, setEspecialidadeFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null, action: "" });

  async function loadProfissionais() {
    try {
      setLoading(true);
      const result = await professionalService.list({
        search,
        status: statusFiltro,
        serviceId: especialidadeFiltro || null,
        page,
        limit,
      });
      setProfissionais(result.data);
      setTotal(result.total);
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao carregar profissionais.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfissionais();
  }, [search, especialidadeFiltro, statusFiltro, page]);

  function handleToggleStatus(item) {
    setConfirmDialog({
      open: true,
      item,
      action: item.status === "active" ? "inactivate" : "activate",
    });
  }

  async function confirmAction() {
    const { item, action } = confirmDialog;
    try {
      const newStatus = action === "inactivate" ? "inactive" : "active";
      await professionalService.update(item.id, { status: newStatus });
      toast({
        title: "Sucesso",
        description: `Profissional ${action === "inactivate" ? "inativado" : "ativado"} com sucesso!`,
        variant: "success",
      });
      loadProfissionais();
    } catch (err) {
      toast({ title: "Erro", description: "Falha na operação.", variant: "error" });
    }
  }

  function formatComissao(p) {
    if (!p.commissionType && !p.commissionValue) return "—";
    if (p.commissionType === "percentage" || (!p.commissionType && p.role)) {
      const valor = p.commissionValue || 30;
      return (
        <span className="inline-flex items-center gap-1 text-slate-700">
          <Percent className="h-3 w-3 text-slate-400" />
          {valor}%
        </span>
      );
    }
    return formatCurrencyBRL(p.commissionValue || 0);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-brand-600" />
            Profissionais
          </h1>
          <p className="text-slate-600 text-sm mt-1">Gerencie sua equipe de colaboradores</p>
        </div>
        <Link href="/profissionais/novo" passHref legacyBehavior>
          <Button asChild icon={<Plus className="h-4 w-4" />}>
            <a>Novo Profissional</a>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar profissional..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Select
              value={especialidadeFiltro}
              onChange={(e) => {
                setEspecialidadeFiltro(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "Todas as especialidades" },
                ...ESPECIALIDADES,
              ]}
            />
            <Select
              value={statusFiltro}
              onChange={(e) => {
                setStatusFiltro(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "Todos os status" },
                { value: "active", label: "Ativo" },
                { value: "inactive", label: "Inativo" },
              ]}
            />
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <SkeletonTable rows={5} cols={7} />
          ) : profissionais.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="Nenhum profissional encontrado"
              description="Tente ajustar os filtros ou cadastre um novo profissional."
              action={{
                label: "Novo Profissional",
                icon: <Plus className="h-4 w-4" />,
                onClick: () => router.push("/profissionais/novo"),
              }}
            />
          ) : (
            <>
              <Table zebra>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]"></TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[140px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profissionais.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Avatar
                          src={p.avatar}
                          name={p.name}
                          size="md"
                          style={p.color ? { backgroundColor: p.color, color: "#fff" } : {}}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{p.name}</div>
                        {p.role && <div className="text-xs text-slate-500">{p.role}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="info">{p.role || "—"}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-slate-700">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {formatPhone(p.phone) || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-slate-700 text-xs">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {p.email || "—"}
                        </span>
                      </TableCell>
                      <TableCell>{formatComissao(p)}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === "active" ? "success" : "muted"}>
                          {p.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Pencil className="h-4 w-4" />}
                            onClick={() => router.push(`/profissionais/${p.id}`)}
                            title="Editar"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={p.status === "active" ? <Archive className="h-4 w-4" /> : <Restore className="h-4 w-4" />}
                            onClick={() => handleToggleStatus(p)}
                            title={p.status === "active" ? "Inativar" : "Ativar"}
                            className={p.status === "active" ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
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
        </CardBody>
      </Card>

      <DialogConfirm
        open={confirmDialog.open}
        onOpenChange={(o) => setConfirmDialog({ ...confirmDialog, open: o })}
        title={confirmDialog.action === "inactivate" ? "Inativar profissional?" : "Ativar profissional?"}
        description={
          confirmDialog.action === "inactivate"
            ? `Deseja realmente inativar "${confirmDialog.item?.name}"? Ele(a) não receberá mais novos agendamentos.`
            : `Deseja realmente ativar "${confirmDialog.item?.name}"?`
        }
        confirmText={confirmDialog.action === "inactivate" ? "Inativar" : "Ativar"}
        variant={confirmDialog.action === "inactivate" ? "danger" : "primary"}
        onConfirm={confirmAction}
      />
    </div>
  );
}

ProfissionaisPage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
