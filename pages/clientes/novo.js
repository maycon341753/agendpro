import React, { useState } from "react";
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
import Textarea from "@/components/ui/Textarea";
import { useToast } from "@/hooks/useToast";
import clientService from "@/services/clientService";
import { formatPhone, formatCPF, formatCEP } from "@/utils/format";
import {
  ArrowLeft,
  UserPlus,
  Save,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
} from "lucide-react";

const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-50">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  </div>
);

const clienteSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().optional().or(z.literal("")),
  phone: z.string().min(10, "Telefone inválido"),
  whatsapp: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .email("E-mail inválido")
    .optional()
    .or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zipCode: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export default function NovoClientePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      name: "",
      cpf: "",
      phone: "",
      whatsapp: "",
      email: "",
      birthDate: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: "",
    },
  });

  const handlePhoneChange = (field) => (e) => {
    const formatted = formatPhone(e.target.value);
    setValue(field, formatted, { shouldValidate: true });
  };

  const handleCPFChange = (e) => {
    const formatted = formatCPF(e.target.value);
    setValue("cpf", formatted, { shouldValidate: true });
  };

  const handleCEPChange = (e) => {
    const formatted = formatCEP(e.target.value);
    setValue("zipCode", formatted, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const created = await clientService.create({
        name: data.name,
        cpf: data.cpf,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        birthDate: data.birthDate,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        notes: data.notes,
        status: "active",
      });

      toast({
        title: "Cliente cadastrado!",
        description: `${data.name} foi adicionado com sucesso.`,
        variant: "success",
      });

      router.push("/clientes");
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível cadastrar o cliente.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/clientes" passHref legacyBehavior>
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="h-7 w-7 text-brand-600" />
              Novo Cliente
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Cadastre um novo cliente no sistema
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-brand-600" />
                Dados Pessoais
              </CardTitle>
              <CardDescription>
                Informações básicas do cliente
              </CardDescription>
            </CardHeader>
            <CardBody className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Input
                    label="Nome Completo"
                    required
                    placeholder="Nome completo do cliente"
                    leftIcon={<User className="h-4 w-4" />}
                    error={errors.name?.message}
                    {...register("name")}
                  />
                </div>
                <div>
                  <Input
                    label="CPF"
                    placeholder="000.000.000-00"
                    maxLength={14}
                    error={errors.cpf?.message}
                    {...register("cpf")}
                    onChange={(e) => {
                      register("cpf").onChange(e);
                      handleCPFChange(e);
                    }}
                  />
                </div>
                <div>
                  <Input
                    label="Data de Nascimento"
                    type="date"
                    leftIcon={<Calendar className="h-4 w-4" />}
                    error={errors.birthDate?.message}
                    {...register("birthDate")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Input
                    label="Telefone"
                    required
                    placeholder="(00) 00000-0000"
                    leftIcon={<Phone className="h-4 w-4" />}
                    error={errors.phone?.message}
                    maxLength={15}
                    {...register("phone")}
                    onChange={(e) => {
                      register("phone").onChange(e);
                      handlePhoneChange("phone")(e);
                    }}
                  />
                </div>
                <div>
                  <Input
                    label="WhatsApp"
                    placeholder="(00) 00000-0000"
                    leftIcon={<Phone className="h-4 w-4" />}
                    error={errors.whatsapp?.message}
                    maxLength={15}
                    {...register("whatsapp")}
                    onChange={(e) => {
                      register("whatsapp").onChange(e);
                      handlePhoneChange("whatsapp")(e);
                    }}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Input
                  label="E-mail"
                  type="email"
                  placeholder="cliente@email.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>
            </CardBody>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand-600" />
                Endereço
              </CardTitle>
              <CardDescription>
                Localização do cliente (opcional)
              </CardDescription>
            </CardHeader>
            <CardBody className="space-y-5">
              <div>
                <Input
                  label="Endereço"
                  placeholder="Rua, avenida, número e complemento"
                  leftIcon={<MapPin className="h-4 w-4" />}
                  error={errors.address?.message}
                  {...register("address")}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-6">
                  <Input
                    label="Cidade"
                    placeholder="Nome da cidade"
                    error={errors.city?.message}
                    {...register("city")}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Estado"
                    placeholder="UF"
                    maxLength={2}
                    error={errors.state?.message}
                    {...register("state")}
                  />
                </div>
                <div className="md:col-span-4">
                  <Input
                    label="CEP"
                    placeholder="00000-000"
                    maxLength={9}
                    error={errors.zipCode?.message}
                    {...register("zipCode")}
                    onChange={(e) => {
                      register("zipCode").onChange(e);
                      handleCEPChange(e);
                    }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-600" />
                Observações
              </CardTitle>
              <CardDescription>
                Anotações importantes sobre o cliente
              </CardDescription>
            </CardHeader>
            <CardBody>
              <Textarea
                label="Observações"
                placeholder="Ex: Alergias, preferências, histórico médico..."
                rows={4}
                error={errors.notes?.message}
                {...register("notes")}
              />
            </CardBody>
            <CardFooter>
              <Link href="/clientes" passHref legacyBehavior>
                <Button variant="outline">Cancelar</Button>
              </Link>
              <Button
                type="submit"
                loading={saving}
                icon={<Save className="h-4 w-4" />}
              >
                {saving ? "Salvando..." : "Cadastrar Cliente"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AdminLayout>
  );
}
