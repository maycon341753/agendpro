import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { toastError, toastSuccess } from "@/lib/utils";
import { Eye, EyeOff, KeyRound, ArrowLeft, AlertTriangle } from "lucide-react";

const senhaSchema = z
  .object({
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirm_password: z.string().min(6, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "As senhas não coincidem",
    path: ["confirm_password"],
  });

export default function AlterarSenhaPage() {
  const router = useRouter();
  const { updatePassword, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [checkedToken, setCheckedToken] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(senhaSchema),
    defaultValues: { password: "", confirm_password: "" },
  });

  useEffect(() => {
    if (!router.isReady) return;
    const token = router.query.token || router.query.access_token;
    if (token || user) {
      setHasToken(true);
    }
    setCheckedToken(true);
  }, [router.isReady, router.query, user]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      await updatePassword(data.password);
      toastSuccess("Senha alterada com sucesso!");
      setTimeout(() => {
        router.replace("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      let msg = "Erro ao alterar senha. Tente novamente.";
      if (error.message?.includes("weak password")) {
        msg = "Senha muito fraca. Use uma senha mais forte.";
      } else if (error.message) {
        msg = error.message;
      }
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!checkedToken) {
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
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Alterar senha
          </h1>
          <p className="text-slate-600 text-sm">
            Defina uma nova senha segura para sua conta.
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            {!hasToken ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-4">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  Link inválido ou expirado
                </h2>
                <p className="text-slate-600 text-sm mb-6">
                  O link de redefinição de senha é inválido ou já expirou.
                  Solicite um novo link.
                </p>
                <Link
                  href="/recuperar-senha"
                  className="btn-primary"
                >
                  Solicitar novo link
                </Link>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="label">Nova senha</label>
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
                    <label className="label">Confirmar nova senha</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="input pr-11"
                        placeholder="Repita a nova senha"
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
                        Alterando...
                      </span>
                    ) : (
                      "Alterar senha"
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
