import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { toastError, toastSuccess, formatPhone } from "@/lib/utils";
import { User, Camera, Phone, Mail, LogOut, Eye, EyeOff, Save, KeyRound } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().min(10, "Telefone inválido").optional().or(z.literal("")),
  whatsapp: z.string().min(10, "WhatsApp inválido").optional().or(z.literal("")),
  avatar_url: z.string().optional().or(z.literal("")),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(6, "Senha atual é obrigatória"),
    new_password: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
    confirm_password: z.string().min(6, "Confirme a nova senha"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "As senhas não coincidem",
    path: ["confirm_password"],
  });

export default function PerfilPage() {
  const router = useRouter();
  const { profile, user, updateProfile, updatePassword, signOut, loading, initialized } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      whatsapp: "",
      avatar_url: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    if (profile) {
      resetProfile({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        whatsapp: profile.whatsapp || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile, resetProfile]);

  const handlePhoneChange = (field) => (e) => {
    const formatted = formatPhone(e.target.value);
    setProfileValue(field, formatted, { shouldValidate: true });
  };

  const onSubmitProfile = async (data) => {
    try {
      setSavingProfile(true);
      await updateProfile({
        full_name: data.full_name,
        phone: data.phone,
        whatsapp: data.whatsapp,
        avatar_url: data.avatar_url,
      });
      toastSuccess("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toastError(error.message || "Erro ao atualizar perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      setSavingPassword(true);
      await updatePassword(data.new_password);
      toastSuccess("Senha alterada com sucesso!");
      resetPassword({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toastError(error.message || "Erro ao alterar senha.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      toastError("Erro ao sair.");
    }
  };

  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Meu Perfil</h1>
            <p className="text-slate-600 text-sm mt-1">
              Gerencie suas informações pessoais
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="btn-secondary gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>

        <div className="card mb-6">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-600" />
              Dados Pessoais
            </h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="shrink-0">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {profile?.full_name
                      ? profile.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <button type="button" className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-brand-600 hover:text-brand-700">
                    <Camera className="w-3 h-3" />
                    Foto
                  </button>
                </div>
                <div className="flex-1 w-full space-y-5">
                  <div>
                    <label className="label">Nome completo</label>
                    <input
                      type="text"
                      className="input"
                      {...registerProfile("full_name")}
                      disabled={savingProfile}
                    />
                    {profileErrors.full_name && (
                      <p className="text-sm text-red-500 mt-1">
                        {profileErrors.full_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label flex items-center gap-1">
                      <Mail className="w-4 h-4 text-slate-400" />
                      E-mail
                    </label>
                    <input
                      type="email"
                      className="input bg-slate-100 cursor-not-allowed"
                      value={user?.email || ""}
                      disabled
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      O e-mail não pode ser alterado.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label flex items-center gap-1">
                    <Phone className="w-4 h-4 text-slate-400" />
                    Telefone
                  </label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="(00) 00000-0000"
                    {...registerProfile("phone")}
                    onChange={handlePhoneChange("phone")}
                    disabled={savingProfile}
                  />
                  {profileErrors.phone && (
                    <p className="text-sm text-red-500 mt-1">
                      {profileErrors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">WhatsApp</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="(00) 00000-0000"
                    {...registerProfile("whatsapp")}
                    onChange={handlePhoneChange("whatsapp")}
                    disabled={savingProfile}
                  />
                  {profileErrors.whatsapp && (
                    <p className="text-sm text-red-500 mt-1">
                      {profileErrors.whatsapp.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-primary gap-2"
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-brand-600" />
              Alterar Senha
            </h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-5 max-w-lg">
              <div>
                <label className="label">Senha atual</label>
                <div className="relative">
                  <input
                    type={showCurrentPwd ? "text" : "password"}
                    className="input pr-11"
                    {...registerPassword("current_password")}
                    disabled={savingPassword}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    tabIndex={-1}
                  >
                    {showCurrentPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.current_password && (
                  <p className="text-sm text-red-500 mt-1">
                    {passwordErrors.current_password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Nova senha</label>
                <div className="relative">
                  <input
                    type={showNewPwd ? "text" : "password"}
                    className="input pr-11"
                    {...registerPassword("new_password")}
                    disabled={savingPassword}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    tabIndex={-1}
                  >
                    {showNewPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.new_password && (
                  <p className="text-sm text-red-500 mt-1">
                    {passwordErrors.new_password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Confirmar nova senha</label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? "text" : "password"}
                    className="input pr-11"
                    {...registerPassword("confirm_password")}
                    disabled={savingPassword}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    tabIndex={-1}
                  >
                    {showConfirmPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.confirm_password && (
                  <p className="text-sm text-red-500 mt-1">
                    {passwordErrors.confirm_password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-primary gap-2"
                  disabled={savingPassword}
                >
                  {savingPassword ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Alterando...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Alterar senha
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
