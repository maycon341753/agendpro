import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { generateSlug, toastError, toastSuccess, formatPhone } from "@/lib/utils";
import {
  Building2,
  MapPin,
  Briefcase,
  Palette,
  Link as LinkIcon,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Dados da Empresa",
    description: "Nome, CNPJ e telefone",
    icon: Building2,
  },
  {
    id: 2,
    title: "Endereço",
    description: "Onde você atende",
    icon: MapPin,
  },
  {
    id: 3,
    title: "Tipo de Negócio",
    description: "Qual sua área de atuação",
    icon: Briefcase,
  },
  {
    id: 4,
    title: "Cores e Logo",
    description: "Personalize sua marca",
    icon: Palette,
  },
  {
    id: 5,
    title: "URL / Slug",
    description: "Seu link exclusivo",
    icon: LinkIcon,
  },
  {
    id: 6,
    title: "Horários",
    description: "Dias e horários de atendimento",
    icon: Clock,
  },
];

const schemaStep1 = z.object({
  name: z.string().min(3, "Nome da empresa deve ter pelo menos 3 caracteres"),
  cnpj: z.string().optional(),
  phone: z.string().min(10, "Telefone inválido"),
});

const schemaStep2 = z.object({
  address_street: z.string().min(3, "Rua é obrigatória"),
  address_number: z.string().optional(),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().min(2, "Bairro é obrigatório"),
  address_city: z.string().min(2, "Cidade é obrigatória"),
  address_state: z.string().length(2, "UF inválida"),
  address_zipcode: z.string().optional(),
});

const schemaStep3 = z.object({
  business_type: z.string().min(2, "Selecione ou informe o tipo de negócio"),
  business_custom: z.string().optional(),
});

const schemaStep4 = z.object({
  color_primary: z.string().min(4, "Cor primária inválida").default("#2563eb"),
  color_secondary: z.string().min(4, "Cor secundária inválida").default("#1e40af"),
  logo_url: z.string().optional(),
});

const schemaStep5 = z.object({
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres").regex(/^[a-z0-9-]+$/, "Slug inválido: use apenas letras minúsculas, números e hífens"),
});

const schemaStep6 = z.object({
  open_mon: z.boolean().default(true),
  open_tue: z.boolean().default(true),
  open_wed: z.boolean().default(true),
  open_thu: z.boolean().default(true),
  open_fri: z.boolean().default(true),
  open_sat: z.boolean().default(false),
  open_sun: z.boolean().default(false),
  time_start: z.string().min(4, "Horário inicial inválido").default("08:00"),
  time_end: z.string().min(4, "Horário final inválido").default("18:00"),
});

const businessTypes = [
  "Salão de Beleza",
  "Barbearia",
  "Clínica de Estética",
  "Consultório Odontológico",
  "Consultório Médico",
  "Clínica Veterinária",
  "Studio de Pilates",
  "Academia",
  "Studio de Tatuagem",
  "Spa",
  "Outro",
];

const presetColors = [
  ["#2563eb", "#1e40af"],
  ["#db2777", "#9d174d"],
  ["#7c3aed", "#5b21b6"],
  ["#0891b2", "#155e75"],
  ["#059669", "#047857"],
  ["#ea580c", "#c2410c"],
  ["#dc2626", "#991b1b"],
  ["#475569", "#334155"],
];

export default function SetupPage() {
  const router = useRouter();
  const { user, initialized, loading, company, companies } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    let cancelled = false;
    let timerId = null;
    console.log("[SetupPage] useEffect guard: estado atual:", {
      initialized,
      loading,
      hasUser: !!user,
      hasCompany: !!company,
      companiesCount: Array.isArray(companies) ? companies.length : 0,
    });
    if (!initialized || loading) {
      return;
    }
    if (user) {
      if (company) {
        timerId = setTimeout(() => {
          if (cancelled) return;
          try {
            const agora = Date.now();
            if (agora < (window.__redirectBloqueadoAte || 0)) {
              console.log("[SetupPage] ANTI-LOOP GLOBAL: redirects bloqueados. Ignorar setup→dashboard.");
              return;
            }
            window.__ultimoRedirectAuth = { from: "/setup", to: "/dashboard", ts: agora };
            window.__redirectBloqueadoAte = agora + 2500;
          } catch (_) {}
          console.log("[SetupPage] guard: TEM empresa → /dashboard (push, não replace)");
          router.push("/dashboard");
        }, 400);
        return () => { cancelled = true; if (timerId) clearTimeout(timerId); };
      } else {
        console.log("[SetupPage] guard: user AUTENTICADO SEM empresa → PERMANECE em /setup. Fluxo correto!");
        return;
      }
    }
    if (!user) {
      console.log("[SetupPage] guard: user=null no React, verificando sessão real e esperando +2.5s para sincronizar...");
      timerId = setTimeout(async () => {
        if (cancelled) return;
        try {
          const agora = Date.now();
          if (agora < (window.__redirectBloqueadoAte || 0)) {
            console.log("[SetupPage] ANTI-LOOP GLOBAL: redirects bloqueados. Ignorar setup→login.");
            return;
          }
          const ultimo = window.__ultimoRedirectAuth || null;
          if (ultimo && ultimo.from === "/login" && ultimo.to === "/setup" && (agora - ultimo.ts) < 3000) {
            console.log("[SetupPage] ANTI-LOOP: login→setup disparou há", agora - ultimo.ts, "ms → user ainda null no React, mas esperar +sincronia ao invés de voltar pro login.");
            return;
          }
        } catch (_) {}
        let sessaoRealExiste = false;
        try {
          if (supabase && supabase.auth && typeof supabase.auth.getSession === "function") {
            const { data: { session: sessaoReal } } = await supabase.auth.getSession();
            sessaoRealExiste = !!sessaoReal?.user;
          }
        } catch (_) { sessaoRealExiste = false; }
        if (sessaoRealExiste) {
          console.log("[SetupPage] guard: SESSAO EXISTE no storage mas user=null no React → SEM REDIRECT, aguarda AuthProvider sincronizar.");
          return;
        }
        const qs = new URLSearchParams({ redirect: "/setup" }).toString();
        console.log("[SetupPage] guard: CONFIRMADO sessão ausente → /login?" + qs);
        try {
          const agora = Date.now();
          window.__ultimoRedirectAuth = { from: "/setup", to: "/login", ts: agora };
          window.__redirectBloqueadoAte = agora + 3000;
        } catch (_) {}
        router.push(`/login?${qs}`);
      }, 2500);
      return () => { cancelled = true; if (timerId) clearTimeout(timerId); };
    }
  }, [initialized, loading, user, company, companies]);

  const schemaByStep = {
    1: schemaStep1,
    2: schemaStep2,
    3: schemaStep3,
    4: schemaStep4,
    5: schemaStep5,
    6: schemaStep6,
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schemaByStep[currentStep]),
    defaultValues: {
      ...{
        name: "",
        cnpj: "",
        phone: "",
      },
      ...{
        address_street: "",
        address_number: "",
        address_complement: "",
        address_neighborhood: "",
        address_city: "",
        address_state: "",
        address_zipcode: "",
      },
      ...{
        business_type: "",
        business_custom: "",
      },
      ...{
        color_primary: "#2563eb",
        color_secondary: "#1e40af",
        logo_url: "",
      },
      ...{
        slug: "",
      },
      ...{
        open_mon: true,
        open_tue: true,
        open_wed: true,
        open_thu: true,
        open_fri: true,
        open_sat: false,
        open_sun: false,
        time_start: "08:00",
        time_end: "18:00",
      },
    },
  });

  useEffect(() => {
    const name = watch("name");
    if (name && currentStep === 5) {
      const slug = formData.slug || generateSlug(name);
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [watch("name"), currentStep, setValue, formData.slug]);

  const handleNext = async (stepData) => {
    const merged = { ...formData, ...stepData };
    setFormData(merged);
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleFinalSubmit(merged);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = async (data) => {
    try {
      setSubmitting(true);
      const companyData = {
        name: data.name,
        cnpj: data.cnpj || null,
        phone: data.phone,
        address_street: data.address_street,
        address_number: data.address_number || null,
        address_complement: data.address_complement || null,
        address_neighborhood: data.address_neighborhood,
        address_city: data.address_city,
        address_state: data.address_state,
        address_zipcode: data.address_zipcode || null,
        business_type: data.business_type === "Outro" ? data.business_custom : data.business_type,
        color_primary: data.color_primary,
        color_secondary: data.color_secondary,
        logo_url: data.logo_url || null,
        slug: data.slug,
        open_mon: data.open_mon,
        open_tue: data.open_tue,
        open_wed: data.open_wed,
        open_thu: data.open_thu,
        open_fri: data.open_fri,
        open_sat: data.open_sat,
        open_sun: data.open_sun,
        time_start: data.time_start,
        time_end: data.time_end,
        status: "active",
      };

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert(companyData)
        .select()
        .single();

      if (companyError) throw companyError;

      if (company && user) {
        const { error: memberError } = await supabase
          .from("company_users")
          .insert({
            company_id: company.id,
            user_id: user.id,
            role: "admin_empresa",
            status: "active",
          });
        if (memberError) throw memberError;
      }

      toastSuccess("Configuração concluída! Bem-vindo ao sistema.");
      setTimeout(() => {
        router.replace("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Erro no setup:", error);
      toastError(error.message || "Erro ao criar empresa. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setValue("phone", formatted, { shouldValidate: true });
  };

  const selectColorPreset = (primary, secondary) => {
    setValue("color_primary", primary, { shouldValidate: true });
    setValue("color_secondary", secondary, { shouldValidate: true });
  };

  const handleAutoGenerateSlug = () => {
    if (formData.name || watch("name")) {
      const slug = generateSlug(formData.name || watch("name"));
      setValue("slug", slug, { shouldValidate: true });
    }
  };

  const onSubmit = handleSubmit(handleNext);

  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const Icon = steps[currentStep - 1].icon;
  const businessType = watch("business_type");

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 bg-brand-100 text-brand-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Configuração inicial
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Vamos configurar sua empresa
          </h1>
          <p className="text-slate-600">
            Leva menos de 2 minutos. Pule o que não souber agora, você pode
            alterar depois.
          </p>
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isDone = step.id < currentStep;
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      isDone
                        ? "bg-green-500 text-white shadow-md"
                        : isActive
                        ? "bg-brand-600 text-white shadow-md ring-4 ring-brand-100"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="hidden sm:block mt-2 text-center">
                    <p
                      className={`text-xs font-medium ${
                        isActive ? "text-brand-700" : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hidden sm:flex gap-1 px-5">
            {steps.slice(0, -1).map((_, idx) => (
              <div key={idx} className="flex-1">
                <div
                  className={`h-1 rounded-full transition-colors ${
                    idx < currentStep - 1
                      ? "bg-green-500"
                      : "bg-slate-200"
                  }`}
                ></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-brand-600 font-semibold uppercase tracking-wide">
                  Passo {currentStep} de {steps.length}
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {steps[currentStep - 1].title}
                </h2>
                <p className="text-sm text-slate-500">
                  {steps[currentStep - 1].description}
                </p>
              </div>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={onSubmit}>
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="label">Nome da empresa *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Ex: Clínica Dra. Ana Silva"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="label">CNPJ (opcional)</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="00.000.000/0000-00"
                        {...register("cnpj")}
                      />
                      {errors.cnpj && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.cnpj.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label">Telefone da empresa *</label>
                      <input
                        type="tel"
                        className="input"
                        placeholder="(00) 00000-0000"
                        {...register("phone")}
                        onChange={handlePhoneChange}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="sm:col-span-2">
                      <label className="label">Rua *</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Av. Brasil"
                        {...register("address_street")}
                      />
                      {errors.address_street && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.address_street.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label">Número</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="123"
                        {...register("address_number")}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Complemento</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Sala 201, Bloco A"
                      {...register("address_complement")}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="label">Bairro *</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Centro"
                        {...register("address_neighborhood")}
                      />
                      {errors.address_neighborhood && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.address_neighborhood.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label">Cidade *</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="São Paulo"
                        {...register("address_city")}
                      />
                      {errors.address_city && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.address_city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label">UF *</label>
                      <input
                        type="text"
                        className="input uppercase"
                        placeholder="SP"
                        maxLength={2}
                        {...register("address_state")}
                      />
                      {errors.address_state && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.address_state.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="label">CEP</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="00000-000"
                      {...register("address_zipcode")}
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <label className="label">Tipo de negócio *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {businessTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setValue("business_type", type, { shouldValidate: true });
                          }}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                            businessType === type
                              ? "border-brand-500 bg-brand-50 text-brand-700"
                              : "border-slate-200 hover:border-slate-300 text-slate-700"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {errors.business_type && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.business_type.message}
                      </p>
                    )}
                  </div>
                  {businessType === "Outro" && (
                    <div>
                      <label className="label">Qual seu tipo de negócio? *</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Descreva seu negócio"
                        {...register("business_custom")}
                      />
                      {errors.business_custom && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.business_custom.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-5">
                  <div>
                    <label className="label">Cores predefinidas</label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                      {presetColors.map(([primary, secondary], idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="aspect-square rounded-lg p-1 border-2 transition-all hover:scale-105"
                          style={{
                            borderColor:
                              watch("color_primary") === primary ? "#2563eb" : "#e2e8f0",
                          }}
                          onClick={() => selectColorPreset(primary, secondary)}
                        >
                          <div
                            className="w-full h-full rounded-md"
                            style={{
                              background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
                            }}
                          ></div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="label">Cor primária</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          className="w-12 h-10 rounded-lg border border-slate-300 cursor-pointer"
                          {...register("color_primary")}
                        />
                        <input
                          type="text"
                          className="input"
                          {...register("color_primary")}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Cor secundária</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          className="w-12 h-10 rounded-lg border border-slate-300 cursor-pointer"
                          {...register("color_secondary")}
                        />
                        <input
                          type="text"
                          className="input"
                          {...register("color_secondary")}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-xs text-slate-500 font-medium mb-2">
                      Prévia:
                    </div>
                    <div
                      className="h-16 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${watch("color_primary")} 0%, ${watch("color_secondary")} 100%)`,
                      }}
                    >
                      {formData.name || "Sua Empresa"}
                    </div>
                  </div>
                  <div>
                    <label className="label">URL do logo (opcional)</label>
                    <input
                      type="url"
                      className="input"
                      placeholder="https://..."
                      {...register("logo_url")}
                    />
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-5">
                  <div>
                    <label className="label">Slug / URL personalizada *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                        agendpro.com.br/
                      </span>
                      <input
                        type="text"
                        className="input rounded-l-none"
                        placeholder="clinica-ana-silva"
                        {...register("slug")}
                        style={{ textTransform: "lowercase" }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      {errors.slug ? (
                        <p className="text-sm text-red-500">
                          {errors.slug.message}
                        </p>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Sua página de agendamento pública ficará disponível
                          nesta URL.
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleAutoGenerateSlug}
                        className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                      >
                        Gerar automaticamente
                      </button>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-xs text-slate-500 font-medium mb-2">
                      Exemplo de página do cliente:
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                      <div className="text-brand-600 font-medium text-sm break-all">
                        agendpro.com.br/
                        <span className="text-slate-800 font-semibold">
                          {watch("slug") || "seu-slug"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-5">
                  <div>
                    <label className="label">Dias de funcionamento</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { key: "open_mon", label: "Segunda" },
                        { key: "open_tue", label: "Terça" },
                        { key: "open_wed", label: "Quarta" },
                        { key: "open_thu", label: "Quinta" },
                        { key: "open_fri", label: "Sexta" },
                        { key: "open_sat", label: "Sábado" },
                        { key: "open_sun", label: "Domingo" },
                      ].map(({ key, label }) => (
                        <label
                          key={key}
                          className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            watch(key)
                              ? "border-brand-500 bg-brand-50 text-brand-700"
                              : "border-slate-200 hover:border-slate-300 text-slate-600"
                          }`}
                        >
                          <input
                            type="checkbox"
                            {...register(key)}
                            className="w-4 h-4 accent-brand-600"
                          />
                          <span className="text-sm font-medium">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="label">Horário de abertura</label>
                      <input
                        type="time"
                        className="input"
                        {...register("time_start")}
                      />
                      {errors.time_start && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.time_start.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label">Horário de fechamento</label>
                      <input
                        type="time"
                        className="input"
                        {...register("time_end")}
                      />
                      {errors.time_end && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.time_end.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="btn-secondary gap-2"
                    disabled={submitting}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Voltar
                  </button>
                ) : (
                  <div></div>
                )}
                <button
                  type="submit"
                  className="btn-primary gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      {currentStep === 6 ? "Finalizando..." : "Processando..."}
                    </span>
                  ) : currentStep === 6 ? (
                    <>
                      <Check className="w-4 h-4" />
                      Finalizar configuração
                    </>
                  ) : (
                    <>
                      Próximo passo
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
