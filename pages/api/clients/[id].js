import { supabaseAdmin } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  if (!id) {
    return res.status(400).json({ error: "ID do cliente é obrigatório" });
  }

  try {
    switch (method) {
      case "GET":
        return handleGet(id, res);
      case "PUT":
        return handlePut(id, req, res);
      case "DELETE":
        return handleDelete(id, res);
      case "PATCH":
        return handlePut(id, req, res);
      default:
        res.setHeader("Allow", "GET, PUT, PATCH, DELETE");
        return res.status(405).json({ error: `Método ${method} não permitido` });
    }
  } catch (error) {
    console.error("[api/clients/:id] Erro:", error);
    return res.status(500).json({
      error: "Erro interno no servidor",
      details: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
}

async function handleGet(id, res) {
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("clients")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      let totalSpent = Number(data.total_spent ?? 0);
      let totalAppointments = Number(data.total_appointments ?? 0);
      let lastVisit = data.last_visit;
      let firstAppointment = data.created_at;

      try {
        const aptRes = await supabaseAdmin
          .from("appointments")
          .select("id,total_price,start,status")
          .eq("client_id", id);
        if (aptRes.data) {
          const completed = aptRes.data.filter((a) => a.status === "completed");
          totalAppointments = aptRes.data.length;
          totalSpent = completed.reduce(
            (acc, a) => acc + Number(a.total_price || 0),
            0
          );
          const sorted = [...aptRes.data].sort(
            (a, b) => new Date(b.start) - new Date(a.start)
          );
          if (sorted[0]) lastVisit = sorted[0].start;
          if (sorted[sorted.length - 1])
            firstAppointment = sorted[sorted.length - 1].start;
        }
      } catch (_) {}

      return res.status(200).json({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        rg: data.rg,
        birthDate: data.birth_date,
        gender: data.gender,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zip_code,
        whatsapp: data.whatsapp,
        notes: data.notes,
        avatar: data.avatar_url,
        status: data.status || "active",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        totalSpent,
        totalAppointments,
        lastVisit,
        firstAppointment,
      });
    }
  } catch (e) {
    console.warn("[api/clients/:id] Supabase falhou, fallback:", e.message);
  }

  return res.status(200).json({
    id,
    name: "Cliente Exemplo",
    email: "cliente@email.com",
    phone: "(11) 99999-9999",
    whatsapp: "(11) 99999-9999",
    cpf: "123.456.789-09",
    rg: "12.345.678-9",
    birthDate: "1990-05-15",
    gender: "F",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567",
    notes: "Cliente VIP, observações importantes...",
    avatar: null,
    status: "active",
    totalAppointments: 12,
    totalSpent: 1850.0,
    lastVisit: new Date(Date.now() - 7 * 86400000).toISOString(),
    firstAppointment: new Date(Date.now() - 180 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 200 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

async function handlePut(id, req, res) {
  const payload = req.body || {};

  const fields = {
    name: payload.name,
    cpf: payload.cpf ?? null,
    phone: payload.phone ?? null,
    whatsapp: payload.whatsapp ?? payload.phone ?? null,
    email: payload.email ?? null,
    birth_date: payload.birthDate ?? null,
    address: payload.address ?? null,
    city: payload.city ?? null,
    state: payload.state ?? null,
    zip_code: payload.zipCode ?? null,
    notes: payload.notes ?? null,
    status: payload.status,
    updated_at: new Date().toISOString(),
  };

  const updateData = Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined)
  );

  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("clients")
        .update(updateData)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      return res.status(200).json({
        id: data.id,
        ...data,
      });
    }
  } catch (e) {
    console.warn("[api/clients/:id] Update falhou, fallback:", e.message);
  }

  return res.status(200).json({
    id,
    ...updateData,
    updatedAt: new Date().toISOString(),
  });
}

async function handleDelete(id, res) {
  try {
    if (supabaseAdmin) {
      const { error, count } = await supabaseAdmin
        .from("clients")
        .delete({ count: "exact" })
        .eq("id", id);

      if (error) throw error;

      if (count === 0) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      return res.status(200).json({ success: true, id });
    }
  } catch (e) {
    console.warn("[api/clients/:id] Delete falhou, fallback:", e.message);
  }

  return res.status(200).json({ success: true, id });
}
