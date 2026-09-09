import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
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
      console.warn(
        `[supabase${isServerSide ? "Server" : "Client"}] Configuração incompleta, usando fallback client de segurança.`
      );
      return createFallbackClient(isServerSide);
    }
    const client = createClient(url, key, options || {});
    client._isFallbackClient = false;
    return client;
  } catch (err) {
    console.error(
      `[supabase${isServerSide ? "Server" : "Client"}] Falha ao inicializar, usando fallback client de segurança:`,
      err.message
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
