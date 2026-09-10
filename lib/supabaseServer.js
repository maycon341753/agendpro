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
  cleanEnv(process.env.SUPABASE_URL) ||
  cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
  "";
const serviceRoleKey =
  cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
  cleanEnv(process.env.SUPABASE_ANON_KEY) ||
  "";

function createFallbackAdminClient() {
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
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
        gte: () => ({
          lte: () => Promise.resolve({ data: [], error: null }),
        }),
        neq: () => Promise.resolve({ data: [], error: null }),
        order: () => Promise.resolve({ data: [], error: null }),
        limit: () => Promise.resolve({ data: [], error: null }),
        count: () => Promise.resolve({ count: 0, data: [], error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
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
      auth: {
        admin: {
          createUser: () => Promise.resolve({ data: { user: null }, error: new Error("Supabase não configurado.") }),
          listUsers: () => Promise.resolve({ data: { users: [] }, error: null }),
          getUserById: () => Promise.resolve({ data: { user: null }, error: null }),
          deleteUser: () => Promise.resolve({ data: null, error: null }),
          updateUserById: () => Promise.resolve({ data: { user: null }, error: null }),
          generateLink: () => Promise.resolve({ data: null, error: null }),
        },
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
          createSignedUrl: () => Promise.resolve({ data: null, error: null }),
          remove: () => Promise.resolve({ data: null, error: null }),
          list: () => Promise.resolve({ data: [], error: null }),
        }),
        createBucket: () => Promise.resolve({ data: null, error: null }),
        listBuckets: () => Promise.resolve({ data: [], error: null }),
        emptyBucket: () => Promise.resolve({ data: null, error: null }),
        deleteBucket: () => Promise.resolve({ data: null, error: null }),
      },
      schema: () => createFallbackAdminClient(),
      from: (table) => fakeBuilder(table),
      rpc: () => Promise.resolve({ data: null, error: null }),
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

function safeCreateAdminClient(url, key) {
  try {
    if (!url || !key) {
      console.warn("[supabaseServer] Service Role não configurado, usando fallback client.");
      return createFallbackAdminClient();
    }
    const client = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    client._isFallbackClient = false;
    return client;
  } catch (err) {
    console.error("[supabaseServer] Falha ao inicializar admin client:", err.message);
    return createFallbackAdminClient();
  }
}

export const supabaseAdmin = safeCreateAdminClient(supabaseUrl, serviceRoleKey);

export default supabaseAdmin;
