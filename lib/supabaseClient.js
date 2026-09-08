import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

function safeCreateClient(url, key, options) {
  try {
    if (!url || !key) {
      console.warn("[supabaseClient] Configuracao incompleta (build inicial).");
      return null;
    }
    return createClient(url, key, options || {});
  } catch (err) {
    console.error("[supabaseClient] Falha ao inicializar:", err.message);
    return null;
  }
}

export const supabase = safeCreateClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
