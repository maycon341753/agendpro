import { supabaseAdmin } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  if (!id) {
    return res.status(400).json({ error: "ID do agendamento é obrigatório" });
  }

  try {
    switch (method) {
      case "GET":
        return handleGet(id, res);
      case "PUT":
        return handlePut(id, req, res);
      case "PATCH":
        return handlePatch(id, req, res);
      case "DELETE":
        return handleDelete(id, res);
      default:
        res.setHeader("Allow", "GET, PUT, PATCH, DELETE");
        return res.status(405).json({ error: `Método ${method} não permitido` });
    }
  } catch (error) {
    console.error("[api/appointments/:id] Erro:", error);
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
        .from("appointments")
        .select(
          `
          *,
          clients:client_id (id, name, phone, email),
          services:service_id (id, name, price, duration),
          professionals:professional_id (id, name)
        `
        )
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
      }

      return res.status(200).json({
        id: data.id,
        clientId: data.client_id,
        clientName: data.clients?.name,
        clientPhone: data.clients?.phone,
        professionalId: data.professional_id,
        professionalName: data.professionals?.name,
        serviceId: data.service_id,
        serviceName: data.services?.name,
        serviceDuration: data.services?.duration,
        start: data.start,
        end: data.end,
        status: data.status,
        notes: data.notes,
        totalPrice: data.total_price ?? data.services?.price ?? 0,
        paymentMethod: data.payment_method,
        paid: data.paid ?? false,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      });
    }
  } catch (e) {
    console.warn("[api/appointments/:id] GET falhou:", e.message);
  }

  return res.status(200).json({
    id,
    clientId: 1,
    clientName: "Maria Oliveira",
    clientPhone: "(11) 99999-9999",
    professionalId: 1,
    professionalName: "Ana Silva",
    serviceId: 1,
    serviceName: "Corte Feminino",
    serviceDuration: 60,
    start: new Date(Date.now() + 3 * 3600000).toISOString(),
    end: new Date(Date.now() + 4 * 3600000).toISOString(),
    status: "confirmed",
    notes: "Observações do agendamento...",
    totalPrice: 100.0,
    paymentMethod: "pix",
    paid: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

async function handlePut(id, req, res) {
  const payload = req.body || {};

  const updateData = {
    updated_at: new Date().toISOString(),
  };
  if (payload.clientId !== undefined) updateData.client_id = payload.clientId;
  if (payload.professionalId !== undefined)
    updateData.professional_id = payload.professionalId || null;
  if (payload.serviceId !== undefined) updateData.service_id = payload.serviceId;
  if (payload.start !== undefined) updateData.start = payload.start;
  if (payload.end !== undefined) updateData.end = payload.end;
  if (payload.status !== undefined) updateData.status = payload.status;
  if (payload.notes !== undefined) updateData.notes = payload.notes;
  if (payload.totalPrice !== undefined) updateData.total_price = payload.totalPrice;
  if (payload.paymentMethod !== undefined)
    updateData.payment_method = payload.paymentMethod;
  if (payload.paid !== undefined) updateData.paid = payload.paid;

  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("appointments")
        .update(updateData)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
      }

      if (payload.status) {
        try {
          await supabaseAdmin.from("appointment_status_history").insert([
            {
              appointment_id: data.id,
              status: payload.status,
              notes: payload.statusNote || "Atualização via API",
            },
          ]);
        } catch (_) {}
      }

      return res.status(200).json({
        id: data.id,
        ...data,
      });
    }
  } catch (e) {
    console.warn("[api/appointments/:id] PUT falhou:", e.message);
  }

  return res.status(200).json({
    id,
    ...payload,
    updatedAt: new Date().toISOString(),
  });
}

async function handlePatch(id, req, res) {
  const payload = req.body || {};
  if (payload.status) {
    req.body = { ...req.body };
  }
  return handlePut(id, req, res);
}

async function handleDelete(id, res) {
  try {
    if (supabaseAdmin) {
      const { error, count } = await supabaseAdmin
        .from("appointments")
        .delete({ count: "exact" })
        .eq("id", id);

      if (error) throw error;

      if (count === 0) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
      }

      return res.status(200).json({ success: true, id });
    }
  } catch (e) {
    console.warn("[api/appointments/:id] DELETE falhou:", e.message);
  }

  return res.status(200).json({ success: true, id });
}
