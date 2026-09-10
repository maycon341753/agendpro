import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { toastError, toastSuccess } from "@/lib/utils";
import { Eye, EyeOff, LogIn } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export default function LoginPage() {
  const router = useRouter();
  const { redirect } = router.query;
  const { signInWithPassword, user, loading, initialized, company } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    console.log("[LoginPage] useEffect redirect: estado atual:", {
      initialized,
      loading,
      hasUser: !!user,
      hasCompany: !!company,
      redirect: redirect ? String(redirect) : null,
    });
    if (!(initialized && !loading && user)) {
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      try {
        const agora = Date.now();
        const bloqueioGlobal = window.__redirectBloqueadoAte || 0;
        if (agora < bloqueioGlobal) {
          console.log("[LoginPage] ANTI-LOOP GLOBAL: redirects BLOQUEADOS por", (bloqueioGlobal - agora), "ms. Ignorar.");
          return;
        }
        const ultimo = window.__ultimoRedirectAuth || null;
        if (ultimo && ultimo.from === "/setup" && ultimo.to === "/login" && (agora - ultimo.ts) < 2500) {
          console.log("[LoginPage] ANTI-LOOP: setup→login disparou há", agora - ultimo.ts, "ms → IGNORAR login→setup para evitar ping-pong.", ultimo);
          return;
        }
        if (ultimo && ultimo.from === "/login" && (agora - ultimo.ts) < 2500) {
          console.log("[LoginPage] ANTI-LOOP: login já disparou redirect nos últimos 2.5s → IGNORAR duplicado.");
          return;
        }
      } catch (_) {}
      const redirectStr = redirect ? String(redirect) : null;
      const isSafeRedirect = redirectStr && redirectStr.startsWith("/") && !redirectStr.startsWith("//");
      const isSetupOrLogin = redirectStr === "/setup" || redirectStr === "/login" || !!(redirectStr && redirectStr.startsWith("/login?"));

      let destino;
      if (!company) {
        destino = "/setup";
        console.log("[LoginPage] useEffect redirect (debounced) → SEM EMPRESA → /setup");
      } else {
        if (isSafeRedirect && !isSetupOrLogin) {
          destino = redirectStr;
          console.log("[LoginPage] useEffect redirect (debounced) → COM EMPRESA → redirect seguro:", destino);
        } else {
          destino = "/dashboard";
          console.log("[LoginPage] useEffect redirect (debounced) → COM EMPRESA → padrão /dashboard");
        }
      }
      try {
        const agora = Date.now();
        window.__ultimoRedirectAuth = { from: "/login", to: destino, ts: agora };
        window.__redirectBloqueadoAte = agora + 2500;
      } catch (_) {}
      console.log("[LoginPage] useEffect redirect (debounced) → DESTINO FINAL:", destino);
      router.push(destino);
    }, 800);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [user, initialized, loading, company, redirect]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      console.log("[LoginPage] onSubmit: iniciando signInWithPassword com email:", data.email);
      const authData = await signInWithPassword(data.email, data.password);
      const temEmpresa = !!authData?.company;
      toastSuccess(
        !temEmpresa
          ? "Login realizado com sucesso! Vamos configurar sua empresa (setup)."
          : "Login realizado com sucesso!"
      );
      console.log("[LoginPage] onSubmit: signIn SUCESSO. authData.company =", authData?.company?.name || null, "| temEmpresa =", temEmpresa, "| Aguardando useEffect redirect ser disparado.");
    } catch (error) {
      console.error("[LoginPage] onSubmit: ERRO no login:", error);
      let msg = "Erro ao fazer login. Tente novamente.";
      if (error.message?.includes("Invalid login credentials")) {
        msg = "E-mail ou senha incorretos.";
      } else if (error.message?.includes("Email not confirmed")) {
        msg = "E-mail não confirmado. Verifique sua caixa de entrada.";
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
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Acesse sua conta
          </h1>
          <p className="text-slate-600 text-sm">
            Bem-vindo de volta! Faça login para continuar.
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                <label className="label">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input pr-11"
                    placeholder="Sua senha"
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

              <div className="flex items-center justify-between text-sm">
                <Link
                  href="/recuperar-senha"
                  className="text-brand-600 hover:text-brand-700 font-medium"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3 text-base"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Entrando...
                  </span>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-600">
                Não tem conta?{" "}
                <Link
                  href="/cadastro"
                  className="text-brand-600 hover:text-brand-700 font-medium"
                >
                  Criar conta gratuita
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Ao continuar, você concorda com nossos Termos de Uso e Política de
          Privacidade.
        </p>
      </div>
    </div>
  );
}
