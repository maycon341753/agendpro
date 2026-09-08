import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft, Plus, Tags, Pencil, Trash2, FolderOpen, Save } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import DialogConfirm from "@/components/ui/DialogConfirm";
import { useToast } from "@/hooks/useToast";
import categoryService from "@/services/categoryService";

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}

export default function CategoriasPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", order: "" });
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null });

  async function loadCategorias() {
    try {
      setLoading(true);
      const result = await categoryService.list({ limit: 100 });
      setCategorias(result.data);
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao carregar categorias.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategorias();
  }, []);

  function resetForm() {
    setForm({ name: "", description: "", order: "" });
    setEditing(null);
    setErrors({});
  }

  function handleEdit(item) {
    setEditing(item.id);
    setForm({
      name: item.name,
      description: item.description || "",
      order: item.order ? String(item.order) : "",
    });
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Nome é obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      if (editing) {
        await categoryService.update(editing, {
          name: form.name.trim(),
          description: form.description.trim(),
          order: Number(form.order) || 0,
        });
        toast({ title: "Sucesso", description: "Categoria atualizada!", variant: "success" });
      } else {
        await categoryService.create({
          name: form.name.trim(),
          description: form.description.trim(),
          order: Number(form.order) || 0,
        });
        toast({ title: "Sucesso", description: "Categoria criada!", variant: "success" });
      }
      resetForm();
      loadCategorias();
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao salvar categoria.", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(item) {
    setConfirmDialog({ open: true, item });
  }

  async function confirmDelete() {
    try {
      await categoryService.remove(confirmDialog.item.id);
      toast({ title: "Sucesso", description: "Categoria excluída!", variant: "success" });
      if (editing === confirmDialog.item.id) resetForm();
      loadCategorias();
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao excluir categoria.", variant: "error" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link href="/servicos" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Voltar para serviços
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Tags className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editing ? "Editar Categoria" : "Nova Categoria"}
                </h2>
                <p className="text-xs text-slate-500">
                  {editing ? "Atualize os dados" : "Cadastre uma nova categoria"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nome"
                required
                placeholder="Ex: Cabelo"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
              />
              <Textarea
                label="Descrição"
                rows={2}
                placeholder="Opcional..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <Input
                label="Ordem de exibição"
                type="number"
                min="0"
                placeholder="0"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                helperText="Números menores aparecem primeiro"
              />
              <div className="flex gap-2 pt-2">
                {editing ? (
                  <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                    Cancelar
                  </Button>
                ) : null}
                <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />} className={editing ? "flex-1" : "w-full"}>
                  {editing ? "Atualizar" : "Criar Categoria"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Categorias</h2>
                <p className="text-xs text-slate-500">Total de {categorias.length} categorias</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {loading ? (
              <SkeletonTable rows={5} cols={4} />
            ) : categorias.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="Nenhuma categoria cadastrada"
                description="Crie sua primeira categoria usando o formulário ao lado."
              />
            ) : (
              <Table zebra>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Serviços</TableHead>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorias.map((c) => (
                    <TableRow key={c.id} className={editing === c.id ? "bg-brand-50/40" : ""}>
                      <TableCell>
                        <div className="font-medium text-slate-900">{c.name}</div>
                        {c.description && (
                          <div className="text-xs text-slate-500 line-clamp-1">{c.description}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="info">{c.serviceCount || 0}</Badge>
                      </TableCell>
                      <TableCell className="text-slate-700">{c.order || 0}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === "active" ? "success" : "muted"}>
                          {c.status === "active" ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Pencil className="h-4 w-4" />}
                            onClick={() => handleEdit(c)}
                            title="Editar"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 className="h-4 w-4" />}
                            onClick={() => handleDelete(c)}
                            title="Excluir"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>

      <DialogConfirm
        open={confirmDialog.open}
        onOpenChange={(o) => setConfirmDialog({ ...confirmDialog, open: o })}
        title="Excluir categoria?"
        description={`Deseja realmente excluir a categoria "${confirmDialog.item?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="danger"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

CategoriasPage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
