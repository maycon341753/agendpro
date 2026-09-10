import { createClient } from "@supabase/supabase-js";

function cleanEnv(value, fallback = "") {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "string") return value;
  let v = value.trim();
  if (v.length >= 2) {
    const first = v.charAt(0);
    const last = v.charAt(v.length - 1);
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      v = v.slice(1, -1).trim();
    }
  }
  return v || fallback;
}

const supabaseUrl =
  cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
  cleanEnv(process.env.SUPABASE_URL) ||
  "";
const supabaseAnonKey =
  cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  cleanEnv(process.env.SUPABASE_ANON_KEY) ||
  "";

function createFallbackClient(isServerSide = false) {
  const emptyAuth = {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: new Error("Supabase não configurado.") }),
    signUp: () => Promise.resolve({ data: { user: null, session: null }, error: new Error("Supabase não configurado.") }),
    signOut: () => Promise.resolve({ error: null }),
    resetPasswordForEmail: () => Promise.resolve({ data: null, error: new Error("Supabase não configurado.") }),
    updateUser: () => Promise.resolve({ data: null, error: new Error("Supabase não configurado.") }),
    onAuthStateChange: () => ({
      data: {
        subscription: { unsubscribe: () => undefined },
      },
    }),
  };

  function fakeBuilder(table) {
    return {
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          limit: () => Promise.resolve({ data: [], error: null }),
          order: () => Promise.resolve({ data: [], error: null }),
          gt: () => Promise.resolve({ data: [], error: null }),
          lt: () => Promise.resolve({ data: [], error: null }),
          or: () => Promise.resolve({ data: [], error: null }),
          in: () => Promise.resolve({ data: [], error: null }),
          gte: () => Promise.resolve({ data: [], error: null }),
          lte: () => Promise.resolve({ data: [], error: null }),
        }),
        gte: () => ({
          lte: () => Promise.resolve({ data: [], error: null }),
        }),
        order: () => Promise.resolve({ data: [], error: null }),
        limit: () => Promise.resolve({ data: [], error: null }),
        count: () => Promise.resolve({ count: 0, data: [], error: null }),
      }),
      insert: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
      upsert: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
      }),
      rpc: () => Promise.resolve({ data: null, error: null }),
    };
  }

  return new Proxy(
    {
      auth: emptyAuth,
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
          remove: () => Promise.resolve({ data: null, error: null }),
        }),
      },
      schema: () => createFallbackClient(isServerSide),
      from: (table) => fakeBuilder(table),
      rpc: () => Promise.resolve({ data: null, error: null }),
      channel: () => ({
        on: () => ({
          subscribe: () => ({ unsubscribe: () => undefined }),
        }),
      }),
      removeChannel: () => Promise.resolve(),
      removeAllChannels: () => Promise.resolve(),
      realtime: {
        close: () => undefined,
      },
      functions: {
        invoke: () => Promise.resolve({ data: null, error: null }),
      },
      _isFallbackClient: true,
    },
    {
      get: function (target, prop) {
        if (prop in target) return target[prop];
        if (prop === "then") return undefined;
        return function () {
          if (prop === "from") return fakeBuilder(arguments[0]);
          return Promise.resolve({ data: null, error: null });
        };
      },
    }
  );
}

function safeCreateClient(url, key, options, isServerSide = false) {
  try {
    if (!url || !key) {
      const whichVars = isServerSide
        ? "SUPABASE_URL e SUPABASE_ANON_KEY (ou SUPABASE_SERVICE_ROLE_KEY)"
        : "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY";
      const hint = isServerSide
        ? "Adicione no arquivo .env (servidor) ou nas Environment Variables da Vercel (SEM ASPAS)."
        : "Adicione no arquivo .env local ou nas Environment Variables da Vercel (SEM ASPAS, valor direto). Exemplo:\n  NEXT_PUBLIC_SUPABASE_URL=https://ixwdnrvgtdcdljqtgfzb.supabase.co\n  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
      console.warn(
        `[supabase${isServerSide ? "Server" : "Client"}] ⚠️ Configuração incompleta!\n` +
        `  Variáveis faltando ou vazias: ${whichVars}\n` +
        `  O que fazer: ${hint}\n` +
        `  Usando fallback client de segurança (APENAS para build inicial — cadastro/login NÃO funcionam).`
      );
      return createFallbackClient(isServerSide);
    }
    const client = createClient(url, key, options || {});
    client._isFallbackClient = false;
    return client;
  } catch (err) {
    console.error(
      `[supabase${isServerSide ? "Server" : "Client"}] ❌ Falha ao inicializar cliente Supabase:`,
      err.message,
      "\n  Verifique se as chaves SUPABASE_* estão corretas e SEM ASPAS no valor."
    );
    return createFallbackClient(isServerSide);
  }
}

export const supabase = safeCreateClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
  false
);

export default supabase;
