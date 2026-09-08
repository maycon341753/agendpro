import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { toastError, toastSuccess } from "@/lib/utils";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

const recoverSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
});

export default function RecuperarSenhaPage() {
  const { resetPasswordForEmail } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      await resetPasswordForEmail(data.email);
      setEnviado(true);
      toastSuccess("E-mail de recuperação enviado!");
    } catch (error) {
      console.error("Erro ao recuperar senha:", error);
      let msg = "Erro ao enviar e-mail. Tente novamente.";
      if (error.message) msg = error.message;
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 text-white mb-4 shadow-lg shadow-brand-200">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Recuperar senha
          </h1>
          <p className="text-slate-600 text-sm">
            Informe seu e-mail para receber o link de redefinição.
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            {enviado ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  E-mail enviado!
                </h2>
                <p className="text-slate-600 text-sm mb-6">
                  Verifique sua caixa de entrada e clique no link para definir
                  uma nova senha.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para o login
                </Link>
              </div>
            ) : (
              <>
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

                  <button
                    type="submit"
                    className="btn-primary w-full py-3 text-base"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Enviando...
                      </span>
                    ) : (
                      "Enviar link de recuperação"
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
