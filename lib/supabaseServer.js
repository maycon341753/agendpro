import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    "[supabaseServer] Supabase SERVICE ROLE nao configurado no servidor " +
      "(SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY). APIs protegidas poderao retornar erros."
  );
}

function safeCreateAdminClient(url, key) {
  try {
    if (!url || !key) return null;
    return createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (err) {
    console.error("[supabaseServer] Falha ao inicializar admin client:", err.message);
    return null;
  }
}

export const supabaseAdmin = safeCreateAdminClient(supabaseUrl, serviceRoleKey);

export default supabaseAdmin;
