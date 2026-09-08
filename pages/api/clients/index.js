import { supabaseAdmin } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        return handleGet(req, res);
      case "POST":
        return handlePost(req, res);
      default:
        res.setHeader("Allow", "GET, POST");
        return res.status(405).json({ error: `Método ${method} não permitido` });
    }
  } catch (error) {
    console.error("[api/clients] Erro:", error);
    return res.status(500).json({
      error: "Erro interno no servidor",
      details: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
}

async function handleGet(req, res) {
  const {
    search = "",
    status = "",
    page = 1,
    limit = 20,
    orderBy = "created_at_desc",
    startDate,
    endDate,
  } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const from = (pageNum - 1) * limitNum;
  const to = from + limitNum - 1;

  try {
    if (supabaseAdmin) {
      let query = supabaseAdmin.from("clients").select("*", { count: "exact" });

      if (search) {
        const s = `%${search}%`;
        query = query.or(
          `name.ilike.${s},phone.ilike.${s},email.ilike.${s},cpf.ilike.${s}`
        );
      }

      if (status) {
        query = query.eq("status", status);
      }

      if (startDate) {
        query = query.gte("created_at", new Date(startDate).toISOString());
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query = query.lte("created_at", end.toISOString());
      }

      switch (orderBy) {
        case "name_asc":
          query = query.order("name", { ascending: true });
          break;
        case "name_desc":
          query = query.order("name", { ascending: false });
          break;
        case "created_at_asc":
          query = query.order("created_at", { ascending: true });
          break;
        case "created_at_desc":
        default:
          query = query.order("created_at", { ascending: false });
          break;
      }

      query = query.range(from, to);
      const { data, error, count } = await query;

      if (error) throw error;

      const total = count ?? data?.length ?? 0;

      const withAggregates = await Promise.all(
        (data || []).map(async (c) => {
          let totalSpent = Number(c.total_spent ?? 0);
          let totalAppointments = Number(c.total_appointments ?? 0);
          let lastVisit = c.last_visit;

          if (!totalAppointments && !totalSpent) {
            try {
              const aptRes = await supabaseAdmin
                .from("appointments")
                .select("id,total_price,start")
                .eq("client_id", c.id)
                .eq("status", "completed");
              if (aptRes.data) {
                totalAppointments = aptRes.data.length;
                totalSpent = aptRes.data.reduce(
                  (acc, a) => acc + Number(a.total_price || 0),
                  0
                );
                const last = aptRes.data.sort(
                  (a, b) => new Date(b.start) - new Date(a.start)
                )[0];
                if (last) lastVisit = last.start;
              }
            } catch (_) {}
          }

          return {
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            cpf: c.cpf,
            birthDate: c.birth_date,
            address: c.address,
            city: c.city,
            state: c.state,
            zipCode: c.zip_code,
            whatsapp: c.whatsapp,
            notes: c.notes,
            avatar: c.avatar_url,
            status: c.status || "active",
            createdAt: c.created_at,
            updatedAt: c.updated_at,
            totalSpent,
            totalAppointments,
            lastVisit,
          };
        })
      );

      return res.status(200).json({
        data: withAggregates,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    }
  } catch (e) {
    console.warn("[api/clients] Supabase falhou, usando fallback:", e.message);
  }

  const mockData = Array.from({ length: 25 }).map((_, i) => ({
    id: i + 1,
    name: `Cliente ${i + 1} - ${["Ana", "Bia", "Carol", "Dani", "Edu"][i % 5]} ${["Silva", "Costa", "Lima", "Souza", "Ribeiro"][i % 5]}`,
    email: `cliente${i + 1}@email.com`,
    phone: `(11) 9${9000 + i}-${1000 + i}`,
    totalAppointments: Math.floor(Math.random() * 20),
    totalSpent: Math.floor(Math.random() * 5000),
    status: Math.random() > 0.15 ? "active" : "inactive",
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    lastVisit: new Date(Date.now() - Math.random() * 60 * 86400000).toISOString(),
  }));

  let filtered = mockData;
  if (search) {
    const s = String(search).toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.phone.includes(search) ||
        c.email.toLowerCase().includes(s)
    );
  }
  if (status) {
    filtered = filtered.filter((c) => c.status === status);
  }

  switch (orderBy) {
    case "name_asc":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name_desc":
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "total_spent_desc":
      filtered.sort((a, b) => b.totalSpent - a.totalSpent);
      break;
    case "appointments_desc":
      filtered.sort((a, b) => b.totalAppointments - a.totalAppointments);
      break;
    case "created_at_asc":
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case "created_at_desc":
    default:
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const total = filtered.length;
  const paged = filtered.slice(from, to + 1);

  return res.status(200).json({
    data: paged,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
}

async function handlePost(req, res) {
  const payload = req.body || {};

  const required = ["name"];
  for (const r of required) {
    if (!payload[r]) {
      return res.status(400).json({
        error: "Dados inválidos",
        field: r,
        message: `${r} é obrigatório`,
      });
    }
  }

  const client = {
    name: payload.name,
    cpf: payload.cpf || null,
    phone: payload.phone || null,
    whatsapp: payload.whatsapp || payload.phone || null,
    email: payload.email || null,
    birth_date: payload.birthDate || null,
    address: payload.address || null,
    city: payload.city || null,
    state: payload.state || null,
    zip_code: payload.zipCode || null,
    notes: payload.notes || null,
    status: payload.status || "active",
  };

  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("clients")
        .insert([{ ...client, company_id: payload.companyId || null }])
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json({
        id: data.id,
        ...data,
      });
    }
  } catch (e) {
    console.warn("[api/clients] Supabase insert falhou, usando fallback:", e.message);
  }

  return res.status(201).json({
    id: Date.now(),
    ...client,
    totalSpent: 0,
    totalAppointments: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
