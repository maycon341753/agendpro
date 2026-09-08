import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Scissors } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Modal, { ModalHeader, ModalBody, ModalFooter, ModalTitle } from "@/components/ui/Modal";
import { useToast } from "@/hooks/useToast";
import serviceService from "@/services/serviceService";
import categoryService from "@/services/categoryService";
import { formatCurrencyBRL } from "@/utils/format";

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}

export default function NovoServicoPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    price: "",
    duration: "",
    image: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [modalCategoria, setModalCategoria] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState({ name: "", description: "", order: "" });

  async function loadCategorias() {
    try {
      const data = await categoryService.listAll();
      setCategorias(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadCategorias();
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const e = { ...prev };
        delete e[field];
        return e;
      });
    }
  }

  function handlePriceChange(e) {
    const raw = e.target.value.replace(/\D/g, "");
    const num = (Number(raw) / 100).toFixed(2);
    updateField("price", num);
  }

  function formatPriceDisplay() {
    const num = Number(form.price);
    if (isNaN(num) || form.price === "") return "";
    return formatCurrencyBRL(num).replace("R$", "").trim();
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Nome é obrigatório";
    if (!form.categoryId) e.categoryId = "Categoria é obrigatória";
    if (!form.price || Number(form.price) <= 0) e.price = "Preço é obrigatório";
    if (!form.duration || Number(form.duration) <= 0) e.duration = "Duração é obrigatória";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      await serviceService.create({
        name: form.name.trim(),
        description: form.description.trim(),
        categoryId: Number(form.categoryId),
        category: categorias.find((c) => c.id === Number(form.categoryId))?.name || "",
        price: Number(form.price),
        duration: Number(form.duration),
        image: form.image.trim() || null,
        status: form.status,
      });
      toast({ title: "Sucesso", description: "Serviço criado com sucesso!", variant: "success" });
      router.push("/servicos");
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao criar serviço.", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleCriarCategoria() {
    if (!novaCategoria.name.trim()) {
      toast({ title: "Atenção", description: "Informe o nome da categoria.", variant: "warning" });
      return;
    }
    try {
      const created = await categoryService.create({
        name: novaCategoria.name.trim(),
        description: novaCategoria.description.trim(),
        order: Number(novaCategoria.order) || 0,
      });
      setCategorias((prev) => [...prev, created]);
      updateField("categoryId", String(created.id));
      setNovaCategoria({ name: "", description: "", order: "" });
      setModalCategoria(false);
      toast({ title: "Sucesso", description: "Categoria criada!", variant: "success" });
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao criar categoria.", variant: "error" });
    }
  }

  const categoriaOptions = [
    { value: "", label: "Selecione uma categoria" },
    ...categorias.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link href="/servicos" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Voltar para serviços
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Novo Serviço</h1>
              <p className="text-sm text-slate-500">Cadastre um novo serviço oferecido</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Nome do serviço"
                required
                placeholder="Ex: Corte Feminino"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                error={errors.name}
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    label="Categoria"
                    required
                    value={form.categoryId}
                    onChange={(e) => updateField("categoryId", e.target.value)}
                    options={categoriaOptions}
                    error={errors.categoryId}
                  />
                </div>
                <div className="pt-7">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => setModalCategoria(true)}
                  >
                    Nova
                  </Button>
                </div>
              </div>
            </div>

            <Textarea
              label="Descrição"
              placeholder="Descreva o serviço..."
              rows={3}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <Input
                  label="Preço"
                  required
                  type="text"
                  placeholder="0,00"
                  leftIcon={<span className="text-slate-500 text-xs font-medium">R$</span>}
                  value={formatPriceDisplay()}
                  onChange={handlePriceChange}
                  error={errors.price}
                />
              </div>
              <Input
                label="Duração (minutos)"
                required
                type="number"
                min="1"
                placeholder="60"
                value={form.duration}
                onChange={(e) => updateField("duration", e.target.value)}
                error={errors.duration}
              />
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                options={[
                  { value: "active", label: "Ativo" },
                  { value: "inactive", label: "Inativo" },
                ]}
              />
            </div>

            <Input
              label="URL da imagem"
              placeholder="https://..."
              type="url"
              value={form.image}
              onChange={(e) => updateField("image", e.target.value)}
              helperText="Opcional. Imagem de exibição do serviço."
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Link href="/servicos" passHref legacyBehavior>
                <Button asChild variant="outline">
                  <a>Cancelar</a>
                </Button>
              </Link>
              <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
                Salvar serviço
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Modal open={modalCategoria} onClose={() => setModalCategoria(false)} size="md">
        <ModalHeader>
          <ModalTitle>Nova Categoria</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Nome"
              required
              placeholder="Ex: Cabelo"
              value={novaCategoria.name}
              onChange={(e) => setNovaCategoria({ ...novaCategoria, name: e.target.value })}
            />
            <Textarea
              label="Descrição"
              rows={2}
              placeholder="Opcional..."
              value={novaCategoria.description}
              onChange={(e) => setNovaCategoria({ ...novaCategoria, description: e.target.value })}
            />
            <Input
              label="Ordem"
              type="number"
              min="0"
              placeholder="0"
              value={novaCategoria.order}
              onChange={(e) => setNovaCategoria({ ...novaCategoria, order: e.target.value })}
              helperText="Ordem de exibição nas listas"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalCategoria(false)}>Cancelar</Button>
          <Button onClick={handleCriarCategoria} icon={<Plus className="h-4 w-4" />}>Criar Categoria</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

NovoServicoPage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
