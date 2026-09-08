import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { toastError, toastSuccess, formatPhone } from "@/lib/utils";
import { Eye, EyeOff, UserPlus } from "lucide-react";

const cadastroSchema = z
  .object({
    full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
    phone: z.string().min(10, "Telefone inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirm_password: z.string().min(6, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "As senhas não coincidem",
    path: ["confirm_password"],
  });

export default function CadastroPage() {
  const router = useRouter();
  const { signUp, user, initialized, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    if (initialized && user) {
      router.replace("/setup");
    }
  }, [user, initialized, router]);

  const handlePhoneChange = (e) => {
    const input = e.target;
    const formatted = formatPhone(input.value);
    setValue("phone", formatted, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const result = await signUp(data.email, data.password, {
        data: {
          full_name: data.full_name,
          phone: data.phone,
        },
      });
      if (result.user) {
        try {
          await supabase.from("profiles").upsert({
            id: result.user.id,
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            role: "cliente",
          });
        } catch (profileError) {
          console.warn("Erro ao criar perfil:", profileError);
        }
      }
      toastSuccess("Conta criada com sucesso! Redirecionando...");
      setTimeout(() => {
        router.replace("/setup");
      }, 1500);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      let msg = "Erro ao criar conta. Tente novamente.";
      if (error.message?.includes("already registered")) {
        msg = "Este e-mail já está cadastrado.";
      } else if (error.message?.includes("weak password")) {
        msg = "Senha muito fraca. Use uma senha mais forte.";
      } else if (error.message) {
        msg = error.message;
      }
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 text-white mb-4 shadow-lg shadow-brand-200">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Criar sua conta
          </h1>
          <p className="text-slate-600 text-sm">
            Comece gratuitamente. Configure em menos de 2 minutos.
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Nome completo</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Seu nome completo"
                  {...register("full_name")}
                  disabled={submitting}
                />
                {errors.full_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">E-mail</label>
                <input
                  type="email"
                  className="input"
                  placeholder="seu@email.com"
                  {...register("email")}
                  disabled={submitting}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="(00) 00000-0000"
                  {...register("phone")}
                  onChange={handlePhoneChange}
                  disabled={submitting}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input pr-11"
                    placeholder="Mínimo 6 caracteres"
                    {...register("password")}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Confirmar senha</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="input pr-11"
                    placeholder="Repita a senha"
                    {...register("confirm_password")}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3 text-base"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Criando conta...
                  </span>
                ) : (
                  "Criar conta gratuita"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-600">
                Já tem conta?{" "}
                <Link
                  href="/login"
                  className="text-brand-600 hover:text-brand-700 font-medium"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Ao criar a conta, você concorda com nossos Termos de Uso e Política de
          Privacidade.
        </p>
      </div>
    </div>
  );
}
