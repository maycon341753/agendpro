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
        .single();
      if (error) {
        console.warn("Erro ao buscar perfil:", error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn("Erro ao buscar perfil:", err);
      return null;
    }
  }, []);

  const getUserCompanies = useCallback(async (userId) => {
    if (!userId || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from("company_users")
        .select(
          `
          role,
          companies:company_id (
            id,
            name,
            slug,
            logo,
            color_primary,
            color_secondary,
            status
          )
        `
        )
        .eq("user_id", userId);
      if (error) {
        console.warn("Erro ao buscar empresas do usuário:", error.message);
        return [];
      }
      return (data || [])
        .filter((item) => item.companies)
        .map((item) => ({
          ...item.companies,
          role: item.role,
        }));
    } catch (err) {
      console.warn("Erro ao buscar empresas do usuário:", err);
      return [];
    }
  }, []);

  const loadSession = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      setInitialized(true);
      return;
    }
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const [profileData, companiesData] = await Promise.all([
          getProfile(session.user.id),
          getUserCompanies(session.user.id),
        ]);
        setProfile(profileData);
        setCompanies(companiesData);
        if (companiesData.length > 0 && !company) {
          setCompany(companiesData[0]);
        }
      } else {
        setUser(null);
        setProfile(null);
        setCompanies([]);
        setCompany(null);
      }
    } catch (error) {
      console.error("Erro ao carregar sessão:", error);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [getProfile, getUserCompanies, company]);

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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
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
