import { supabaseAdmin } from "@/lib/supabaseServer";
import { checkConflict } from "@/lib/availability";

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
    console.error("[api/appointments] Erro:", error);
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
    startDate,
    endDate,
    professionalId,
    clientId,
    serviceId,
  } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(200, Math.max(1, Number(limit) || 20));
  const from = (pageNum - 1) * limitNum;
  const to = from + limitNum - 1;

  try {
    if (supabaseAdmin) {
      let query = supabaseAdmin
        .from("appointments")
        .select(
          `
          *,
          clients:client_id (id, name, phone, email),
          services:service_id (id, name, price, duration),
          professionals:professional_id (id, name)
        `,
          { count: "exact" }
        );

      if (status) {
        query = query.eq("status", status);
      }
      if (professionalId) {
        query = query.eq("professional_id", professionalId);
      }
      if (clientId) {
        query = query.eq("client_id", clientId);
      }
      if (serviceId) {
        query = query.eq("service_id", serviceId);
      }
      if (startDate) {
        query = query.gte("start", new Date(startDate).toISOString());
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query = query.lte("start", end.toISOString());
      }

      query = query.order("start", { ascending: true });
      query = query.range(from, to);
      const { data, error, count } = await query;

      if (error) throw error;

      const total = count ?? data?.length ?? 0;

      const formatted = (data || []).map((a) => ({
        id: a.id,
        clientId: a.client_id,
        clientName: a.clients?.name,
        clientPhone: a.clients?.phone,
        professionalId: a.professional_id,
        professionalName: a.professionals?.name,
        serviceId: a.service_id,
        serviceName: a.services?.name,
        serviceDuration: a.services?.duration,
        start: a.start,
        end: a.end,
        status: a.status,
        notes: a.notes,
        totalPrice: a.total_price ?? a.services?.price ?? 0,
        paymentMethod: a.payment_method,
        paid: a.paid ?? false,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      }));

      let filteredFinal = formatted;
      if (search) {
        const s = String(search).toLowerCase();
        filteredFinal = formatted.filter(
          (a) =>
            (a.clientName && a.clientName.toLowerCase().includes(s)) ||
            (a.serviceName && a.serviceName.toLowerCase().includes(s)) ||
            (a.professionalName && a.professionalName.toLowerCase().includes(s)) ||
            String(a.id).includes(search)
        );
      }

      return res.status(200).json({
        data: filteredFinal,
        total: search ? filteredFinal.length : total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(
          (search ? filteredFinal.length : total) / limitNum
        ),
      });
    }
  } catch (e) {
    console.warn("[api/appointments] Supabase falhou, fallback:", e.message);
  }

  const nomes = [
    "Maria Oliveira",
    "João Santos",
    "Ana Paula",
    "Carlos Eduardo",
    "Juliana Rocha",
    "Fernanda Souza",
    "Lucas Martins",
    "Camila Ribeiro",
  ];
  const servicos = [
    "Corte Feminino",
    "Limpeza de Pele",
    "Massagem Relaxante",
    "Depilação",
    "Design de Sobrancelhas",
    "Coloração",
    "Hidratação Capilar",
  ];
  const profissionais = ["Ana Silva", "Juliana Costa", "Fernanda Lima"];
  const statusKeys = ["pending", "confirmed", "completed", "cancelled"];

  const mock = Array.from({ length: 40 }).map((_, i) => {
    const dayOffset = Math.floor(Math.random() * 30) - 10;
    const hours = 8 + Math.floor(Math.random() * 12);
    const mins = [0, 30][Math.floor(Math.random() * 2)];
    const duration = [30, 60, 90][Math.floor(Math.random() * 3)];
    const start = new Date();
    start.setDate(start.getDate() + dayOffset);
    start.setHours(hours, mins, 0, 0);
    const end = new Date(start.getTime() + duration * 60000);

    return {
      id: 100 + i,
      clientId: (i % 10) + 1,
      clientName: nomes[i % nomes.length],
      clientPhone: "(11) 90000-0000",
      professionalId: (i % 3) + 1,
      professionalName: profissionais[i % 3],
      serviceId: (i % 7) + 1,
      serviceName: servicos[i % 7],
      serviceDuration: duration,
      start: start.toISOString(),
      end: end.toISOString(),
      status: statusKeys[Math.floor(Math.random() * statusKeys.length)],
      notes: "",
      totalPrice: [80, 120, 150, 60, 45, 200, 90][i % 7],
      paymentMethod: ["dinheiro", "pix", "credito", ""][i % 4],
      paid: Math.random() > 0.4,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    };
  });

  let filtered = mock;
  if (status) filtered = filtered.filter((a) => a.status === status);
  if (professionalId)
    filtered = filtered.filter(
      (a) => String(a.professionalId) === String(professionalId)
    );
  if (clientId)
    filtered = filtered.filter(
      (a) => String(a.clientId) === String(clientId)
    );
  if (serviceId)
    filtered = filtered.filter(
      (a) => String(a.serviceId) === String(serviceId)
    );
  if (startDate)
    filtered = filtered.filter(
      (a) => new Date(a.start) >= new Date(startDate)
    );
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter((a) => new Date(a.start) <= end);
  }
  if (search) {
    const s = String(search).toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.clientName.toLowerCase().includes(s) ||
        a.serviceName.toLowerCase().includes(s) ||
        a.professionalName.toLowerCase().includes(s)
    );
  }

  filtered.sort((a, b) => new Date(a.start) - new Date(b.start));
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
  const required = ["clientId", "serviceId", "start", "end"];
  for (const r of required) {
    if (!payload[r]) {
      return res.status(400).json({
        error: "Dados inválidos",
        field: r,
        message: `${r} é obrigatório`,
      });
    }
  }

  const start = new Date(payload.start);
  const end = new Date(payload.end);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ error: "Datas inválidas" });
  }
  if (end.getTime() <= start.getTime()) {
    return res.status(400).json({ error: "End deve ser maior que start" });
  }

  try {
    if (supabaseAdmin) {
      let conflictQuery = supabaseAdmin
        .from("appointments")
        .select("*")
        .lt("start", end.toISOString())
        .gt("end", start.toISOString())
        .neq("status", "cancelled")
        .neq("status", "no_show");

      if (payload.professionalId) {
        conflictQuery = conflictQuery.eq(
          "professional_id",
          payload.professionalId
        );
      }
      const { data: existing } = await conflictQuery;

      const hasConflict = existing && existing.length > 0;

      if (hasConflict && !payload.ignoreConflict) {
        return res.status(409).json({
          error: "Conflito de horário",
          hasConflict: true,
          conflictingAppointments: existing?.map((a) => ({
            id: a.id,
            start: a.start,
            end: a.end,
            client_id: a.client_id,
            professional_id: a.professional_id,
          })),
        });
      }

      const insertData = {
        company_id: payload.companyId || null,
        client_id: payload.clientId,
        professional_id: payload.professionalId || null,
        service_id: payload.serviceId,
        start: start.toISOString(),
        end: end.toISOString(),
        status: payload.status || "pending",
        notes: payload.notes || null,
        total_price: payload.totalPrice ?? null,
        payment_method: payload.paymentMethod || null,
        paid: payload.paid ?? !!payload.paymentMethod,
      };

      const { data, error } = await supabaseAdmin
        .from("appointments")
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      try {
        await supabaseAdmin.from("appointment_status_history").insert([
          {
            appointment_id: data.id,
            status: payload.status || "pending",
            notes: "Agendamento criado",
          },
        ]);
      } catch (_) {}

      return res.status(201).json({ id: data.id, ...data });
    }
  } catch (e) {
    console.warn("[api/appointments] POST supabase falhou:", e.message);
  }

  const hasConflict = payload.professionalId === "1" && payload._fakeConflict;

  if (hasConflict) {
    return res.status(409).json({
      error: "Conflito de horário",
      hasConflict: true,
      conflictingAppointments: [
        {
          id: 99,
          start: start.toISOString(),
          end: end.toISOString(),
          clientName: "Cliente Conflitante",
          professionalId: payload.professionalId,
        },
      ],
    });
  }

  return res.status(201).json({
    id: Date.now(),
    ...payload,
    status: payload.status || "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
