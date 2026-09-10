import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const getProfile = useCallback(async (userId) => {
    if (!userId || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) {
        console.warn("Erro ao buscar perfil:", error.message);
        if (error.code === "PGRST116") return null;
        return null;
      }
      return data || null;
    } catch (err) {
      console.warn("Erro ao buscar perfil:", err);
      try {
        const { data: data2, error: error2 } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .limit(1);
        if (error2) return null;
        return (data2 && data2.length > 0) ? data2[0] : null;
      } catch (_) {
        return null;
      }
    }
  }, []);

  const getUserCompanies = useCallback(async (userId) => {
    if (!userId || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from("company_users")
        .select(`*, companies:company_id(*)`)
        .eq("user_id", userId);
      if (error) {
        console.warn("Erro ao buscar empresas do usuário:", error.message);
        try {
          const { data: cuData, error: cuError } = await supabase
            .from("company_users")
            .select("*")
            .eq("user_id", userId);
          if (cuError) return [];
          const cuList = cuData || [];
          const ids = cuList
            .map(c => c.company_id)
            .filter(Boolean);
          if (ids.length === 0) return [];
          const { data: compData, error: compError } = await supabase
            .from("companies")
            .select("*")
            .in("id", ids);
          if (compError) return [];
          const compMap = {};
          (compData || []).forEach(c => { compMap[c.id] = c; });
          return cuList
            .filter(item => item && compMap[item.company_id])
            .map(item => ({
              id: compMap[item.company_id].id,
              name: compMap[item.company_id].name || "Minha Empresa",
              slug: compMap[item.company_id].slug,
              logo: compMap[item.company_id].logo || compMap[item.company_id].logo_url || null,
              color_primary: compMap[item.company_id].color_primary || compMap[item.company_id].primary_color || "#2563eb",
              color_secondary: compMap[item.company_id].color_secondary || compMap[item.company_id].secondary_color || "#1e40af",
              status: compMap[item.company_id].status || "active",
              role: item.role || item.role_name || "admin_empresa",
            }));
        } catch (_) {
          return [];
        }
      }
      return (data || [])
        .filter((item) => item.companies)
        .map((item) => {
          const c = item.companies;
          return {
            id: c.id,
            name: c.name || "Minha Empresa",
            slug: c.slug,
            logo: c.logo || c.logo_url || null,
            color_primary: c.color_primary || c.primary_color || "#2563eb",
            color_secondary: c.color_secondary || c.secondary_color || "#1e40af",
            status: c.status || "active",
            role: item.role || item.role_name || "admin_empresa",
          };
        });
    } catch (err) {
      console.warn("Erro ao buscar empresas do usuário:", err);
      return [];
    }
  }, []);

  const loadSession = useCallback(async () => {
    if (!supabase) {
      console.warn("[AuthContext] loadSession: supabase client fallback/não configurado.");
      setLoading(false);
      setInitialized(true);
      return;
    }
    try {
      console.log("[AuthContext] loadSession: iniciando carregamento de sessão...");
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("[AuthContext] loadSession: getSession retornou:", { hasSession: !!session, userId: session?.user?.id || null });
      if (session?.user) {
        setUser(session.user);
        const [profileData, companiesData] = await Promise.all([
          getProfile(session.user.id),
          getUserCompanies(session.user.id),
        ]);
        console.log("[AuthContext] loadSession: profile+companies carregados:", {
          profileExists: !!profileData,
          companiesCount: Array.isArray(companiesData) ? companiesData.length : 0,
          companiesList: companiesData,
        });
        setProfile(profileData);
        setCompanies(companiesData);
        if (companiesData.length > 0) {
          console.log("[AuthContext] loadSession: selecionando primeira empresa:", companiesData[0]);
          setCompany(companiesData[0]);
        } else {
          setCompany(null);
        }
      } else {
        console.log("[AuthContext] loadSession: sem sessão ativa, limpando estado.");
        setUser(null);
        setProfile(null);
        setCompanies([]);
        setCompany(null);
      }
    } catch (error) {
      console.error("[AuthContext] loadSession: ERRO (catch):", error?.message || error, error);
    } finally {
      console.log("[AuthContext] loadSession: finalizado (initialized=true).");
      setLoading(false);
      setInitialized(true);
    }
  }, [getProfile, getUserCompanies]);

  useEffect(() => {
    loadSession();
    if (!supabase) return;
    let subscription = null;
    try {
      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          const [profileData, companiesData] = await Promise.all([
            getProfile(session.user.id),
            getUserCompanies(session.user.id),
          ]);
          setProfile(profileData);
          setCompanies(companiesData);
          if (companiesData.length > 0) {
            setCompany(companiesData[0]);
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setCompanies([]);
          setCompany(null);
        } else if (event === "USER_UPDATED" && session?.user) {
          setUser(session.user);
          const profileData = await getProfile(session.user.id);
          setProfile(profileData);
        }
      });
      subscription = sub;
    } catch (err) {
      console.error("Erro ao registrar onAuthStateChange:", err);
    }
    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        try { subscription.unsubscribe(); } catch (_) {}
      }
    };
  }, [loadSession, getProfile, getUserCompanies]);

  const signInWithPassword = async (email, password) => {
    if (!supabase) throw new Error("Supabase não configurado.");
    console.log("[AuthContext] signInWithPassword: iniciando login com email:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("[AuthContext] signInWithPassword: FALHA no auth:", error?.message || error);
      throw error;
    }
    console.log("[AuthContext] signInWithPassword: auth SUCESSO:", { userId: data?.user?.id });
    let profileData = null;
    let companiesData = [];
    let selectedCompany = null;
    if (data?.user) {
      [profileData, companiesData] = await Promise.all([
        getProfile(data.user.id),
        getUserCompanies(data.user.id),
      ]);
      console.log("[AuthContext] signInWithPassword: profile+companies carregados pós-login:", {
        profileExists: !!profileData,
        companiesCount: Array.isArray(companiesData) ? companiesData.length : 0,
        companiesList: companiesData,
      });
      if (companiesData.length > 0) {
        selectedCompany = companiesData[0];
        console.log("[AuthContext] signInWithPassword: empresa selecionada → REDIRECT ESPERADO: /dashboard");
      } else {
        console.log("[AuthContext] signInWithPassword: SEM EMPRESA → REDIRECT ESPERADO: /setup");
      }
      setUser(data.user);
      setProfile(profileData);
      setCompanies(companiesData);
      setCompany(selectedCompany);
    }
    return {
      ...data,
      profile: profileData,
      companies: companiesData,
      company: selectedCompany,
    };
  };

  const signUp = async (email, password, options = {}) => {
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: options.data || {},
        ...options,
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    setUser(null);
    setProfile(null);
    setCompanies([]);
    setCompany(null);
  };

  const resetPasswordForEmail = async (email) => {
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8080"}/alterar-senha`,
    });
    if (error) throw error;
    return data;
  };

  const updatePassword = async (newPassword) => {
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error("Usuário não autenticado");
    if (!supabase) throw new Error("Supabase não configurado.");
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  };

  const value = {
    user,
    profile,
    company,
    companies,
    loading,
    initialized,
    setCompany,
    signInWithPassword,
    signUp,
    signOut,
    resetPasswordForEmail,
    updatePassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}

export default AuthContext;
