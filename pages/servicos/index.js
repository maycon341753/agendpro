import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Scissors, Plus, Search, Pencil, Archive, RotateCcw, FolderOpen } from "lucide-react";
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
import serviceService from "@/services/serviceService";
import categoryService from "@/services/categoryService";
import { formatCurrencyBRL } from "@/utils/format";

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}

export default function ServicosPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [servicos, setServicos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null, action: "" });

  async function loadCategorias() {
    try {
      const data = await categoryService.listAll();
      setCategorias(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadServicos() {
    try {
      setLoading(true);
      const result = await serviceService.list({
        search,
        status: statusFiltro,
        categoryId: categoriaFiltro || null,
        page,
        limit,
      });
      setServicos(result.data);
      setTotal(result.total);
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao carregar serviços.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategorias();
  }, []);

  useEffect(() => {
    loadServicos();
  }, [search, categoriaFiltro, statusFiltro, page]);

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
      await serviceService.update(item.id, { status: newStatus });
      toast({
        title: "Sucesso",
        description: `Serviço ${action === "inactivate" ? "inativado" : "ativado"} com sucesso!`,
        variant: "success",
      });
      loadServicos();
    } catch (err) {
      toast({ title: "Erro", description: "Falha na operação.", variant: "error" });
    }
  }

  const categoriaOptions = [
    { value: "", label: "Todas as categorias" },
    ...categorias.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Scissors className="h-6 w-6 text-brand-600" />
            Serviços
          </h1>
          <p className="text-slate-600 text-sm mt-1">Gerencie os serviços oferecidos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/servicos/categorias" passHref legacyBehavior>
            <Button asChild variant="outline">
              <a>Nova Categoria</a>
            </Button>
          </Link>
          <Link href="/servicos/novo" passHref legacyBehavior>
            <Button asChild icon={<Plus className="h-4 w-4" />}>
              <a>Novo Serviço</a>
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar serviço..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Select
              value={categoriaFiltro}
              onChange={(e) => {
                setCategoriaFiltro(e.target.value);
                setPage(1);
              }}
              options={categoriaOptions}
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
            <SkeletonTable rows={5} cols={6} />
          ) : servicos.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="Nenhum serviço encontrado"
              description="Tente ajustar os filtros ou crie um novo serviço."
              action={{
                label: "Novo Serviço",
                icon: <Plus className="h-4 w-4" />,
                onClick: () => router.push("/servicos/novo"),
              }}
            />
          ) : (
            <>
              <Table zebra>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]"></TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[140px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicos.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Avatar
                          src={s.image}
                          name={s.name}
                          size="md"
                          className={s.color ? "" : ""}
                          style={s.color ? { backgroundColor: s.color, color: "#fff" } : {}}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{s.name}</div>
                        {s.description && (
                          <div className="text-xs text-slate-500 line-clamp-1">{s.description}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="info">{s.category}</Badge>
                      </TableCell>
                      <TableCell className="text-slate-700">{s.duration} min</TableCell>
                      <TableCell className="font-medium text-slate-900">{formatCurrencyBRL(s.price)}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === "active" ? "success" : "muted"}>
                          {s.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Pencil className="h-4 w-4" />}
                            onClick={() => router.push(`/servicos/${s.id}`)}
                            title="Editar"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={s.status === "active" ? <Archive className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                            onClick={() => handleToggleStatus(s)}
                            title={s.status === "active" ? "Inativar" : "Ativar"}
                            className={s.status === "active" ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
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
        title={confirmDialog.action === "inactivate" ? "Inativar serviço?" : "Ativar serviço?"}
        description={
          confirmDialog.action === "inactivate"
            ? `Deseja realmente inativar o serviço "${confirmDialog.item?.name}"? Ele não aparecerá mais no agendamento online.`
            : `Deseja realmente ativar o serviço "${confirmDialog.item?.name}"?`
        }
        confirmText={confirmDialog.action === "inactivate" ? "Inativar" : "Ativar"}
        variant={confirmDialog.action === "inactivate" ? "danger" : "primary"}
        onConfirm={confirmAction}
      />
    </div>
  );
}

ServicosPage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
