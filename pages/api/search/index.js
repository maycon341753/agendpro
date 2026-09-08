import { supabaseAdmin } from "@/lib/supabaseServer";
import { formatDateBR, formatTime, formatCurrencyBRL } from "@/utils/format";
import { APPOINTMENT_STATUS } from "@/utils/constants";

const MAX_PER_TYPE = 5;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: `Método ${req.method} não permitido` });
  }

  try {
    const { q = "" } = req.query;
    const query = String(q || "").trim();

    if (!query) {
      return res.status(200).json({
        query: "",
        total: 0,
        groups: {
          clients: [],
          appointments: [],
          services: [],
          professionals: [],
        },
      });
    }

    const s = `%${query}%`;
    const likeOp = "ilike";

    const promises = [];
    promises.push(searchClients(s, query));
    promises.push(searchAppointments(s, query));
    promises.push(searchServices(s, query));
    promises.push(searchProfessionals(s, query));

    const [clients, appointments, services, professionals] =
      await Promise.all(promises);

    const total =
      clients.length + appointments.length + services.length + professionals.length;

    return res.status(200).json({
      query,
      total,
      groups: {
        clients,
        appointments,
        services,
        professionals,
      },
    });
  } catch (error) {
    console.error("[api/search] Erro:", error);
    return res.status(500).json({
      error: "Erro interno no servidor",
      details: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
}

async function searchClients(like, plain) {
  try {
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from("clients")
        .select("id, name, phone, email, avatar_url, status")
        .or(
          `name.${likeOp}.${like},phone.${likeOp}.${like},email.${likeOp}.${like},cpf.${likeOp}.${like}`
        )
        .order("name", { ascending: true })
        .limit(MAX_PER_TYPE);

      return (data || []).map((c) => ({
        type: "client",
        id: c.id,
        title: c.name,
        subtitle: [c.phone, c.email].filter(Boolean).join(" • "),
        meta: { status: c.status || "active" },
        avatar: c.avatar_url,
        href: `/clientes/${c.id}`,
      }));
    }
  } catch (e) {
    console.warn("[search] clients falhou:", e.message);
  }

  const q = plain.toLowerCase();
  const mock = [
    {
      id: 1,
      name: "Maria Oliveira",
      phone: "(11) 99999-9999",
      email: "maria@email.com",
    },
    {
      id: 2,
      name: "Ana Clara Souza",
      phone: "(11) 98888-8888",
      email: "ana@email.com",
    },
    {
      id: 3,
      name: "João Silva",
      phone: "(11) 97777-7777",
      email: "joao@email.com",
    },
    {
      id: 4,
      name: "Carolina Mendes",
      phone: "(11) 96666-6666",
      email: "carol@email.com",
    },
    {
      id: 5,
      name: "Lucas Pereira",
      phone: "(11) 95555-5555",
      email: "lucas@email.com",
    },
    {
      id: 6,
      name: "Fernanda Costa",
      phone: "(11) 94444-4444",
      email: "fernanda@email.com",
    },
  ];

  return mock
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(plain) ||
        c.email.toLowerCase().includes(q)
    )
    .slice(0, MAX_PER_TYPE)
    .map((c) => ({
      type: "client",
      id: c.id,
      title: c.name,
      subtitle: `${c.phone} • ${c.email}`,
      meta: { status: "active" },
      href: `/clientes/${c.id}`,
    }));
}

async function searchAppointments(like, plain) {
  try {
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from("appointments")
        .select(
          `
          id, start, end, status, total_price,
          clients:client_id(name),
          services:service_id(name),
          professionals:professional_id(name)
        `
        )
        .or(`status.${likeOp}.${like}`)
        .order("start", { ascending: false })
        .limit(MAX_PER_TYPE);

      const byClient = await (async () => {
        try {
          const { data: list } = await supabaseAdmin
            .from("appointments")
            .select(
              `id, start, end, status, total_price, clients:client_id(name), services:service_id(name), professionals:professional_id(name)`
            )
            .textSearch("clients.name_tsv", plain, {
              type: "websearch",
              config: "portuguese",
            })
            .limit(MAX_PER_TYPE);
          return list || [];
        } catch (_) {
          return [];
        }
      })();

      const combined = [...(data || []), ...byClient];
      const unique = Array.from(new Map(combined.map((a) => [a.id, a])).values()).slice(
        0,
        MAX_PER_TYPE
      );

      return unique.map((a) => ({
        type: "appointment",
        id: a.id,
        title: a.clients?.name || `Agendamento #${a.id}`,
        subtitle: [
          a.services?.name,
          a.professionals?.name,
          formatDateBR(a.start),
          `${formatTime(a.start)}-${formatTime(a.end)}`,
        ]
          .filter(Boolean)
          .join(" • "),
        meta: {
          status: a.status,
          statusLabel: APPOINTMENT_STATUS[a.status]?.label || a.status,
          totalPrice: a.total_price,
        },
        badge: APPOINTMENT_STATUS[a.status]?.label,
        badgeColor: APPOINTMENT_STATUS[a.status]?.color,
        href: `/agendamentos/${a.id}`,
      }));
    }
  } catch (e) {
    console.warn("[search] appointments falhou:", e.message);
  }

  const q = plain.toLowerCase();
  const mock = [
    {
      id: 101,
      client: "Maria Oliveira",
      service: "Corte Feminino",
      professional: "Ana Silva",
      start: new Date(Date.now() + 3 * 3600000).toISOString(),
      end: new Date(Date.now() + 4 * 3600000).toISOString(),
      status: "confirmed",
      total_price: 100,
    },
    {
      id: 102,
      client: "João Silva",
      service: "Limpeza de Pele",
      professional: "Juliana Costa",
      start: new Date(Date.now() + 86400000).toISOString(),
      end: new Date(Date.now() + 86400000 + 90 * 60000).toISOString(),
      status: "pending",
      total_price: 180,
    },
    {
      id: 103,
      client: "Ana Clara",
      service: "Massagem Relaxante",
      professional: "Fernanda Lima",
      start: new Date(Date.now() + 2 * 86400000).toISOString(),
      end: new Date(Date.now() + 2 * 86400000 + 60 * 60000).toISOString(),
      status: "confirmed",
      total_price: 150,
    },
  ];

  return mock
    .filter(
      (a) =>
        a.client.toLowerCase().includes(q) ||
        a.service.toLowerCase().includes(q) ||
        a.professional.toLowerCase().includes(q) ||
        a.status.includes(q) ||
        String(a.id).includes(plain)
    )
    .slice(0, MAX_PER_TYPE)
    .map((a) => ({
      type: "appointment",
      id: a.id,
      title: a.client,
      subtitle: [
        a.service,
        a.professional,
        formatDateBR(a.start),
        `${formatTime(a.start)}-${formatTime(a.end)}`,
      ].join(" • "),
      meta: {
        status: a.status,
        statusLabel: APPOINTMENT_STATUS[a.status]?.label,
        totalPrice: a.total_price,
      },
      badge: APPOINTMENT_STATUS[a.status]?.label,
      badgeColor: APPOINTMENT_STATUS[a.status]?.color,
      href: `/agendamentos/${a.id}`,
    }));
}

async function searchServices(like, plain) {
  try {
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from("services")
        .select("id, name, description, price, duration, active")
        .or(`name.${likeOp}.${like},description.${likeOp}.${like}`)
        .order("name", { ascending: true })
        .limit(MAX_PER_TYPE);

      return (data || []).map((s) => ({
        type: "service",
        id: s.id,
        title: s.name,
        subtitle: [
          s.duration ? `${s.duration} min` : null,
          formatCurrencyBRL(s.price),
          s.description,
        ]
          .filter(Boolean)
          .join(" • "),
        meta: {
          price: s.price,
          duration: s.duration,
          active: s.active !== false,
        },
        href: `/servicos/${s.id}`,
      }));
    }
  } catch (e) {
    console.warn("[search] services falhou:", e.message);
  }

  const q = plain.toLowerCase();
  const mock = [
    { id: 1, name: "Corte Feminino", description: "Corte + lavagem + finalização", price: 100, duration: 60 },
    { id: 2, name: "Limpeza de Pele", description: "Tratamento facial", price: 180, duration: 90 },
    { id: 3, name: "Massagem Relaxante", description: "Massagem sueca", price: 150, duration: 60 },
    { id: 4, name: "Depilação Completa", description: "Corpo todo", price: 220, duration: 120 },
    { id: 5, name: "Design de Sobrancelhas", description: "Design + henna", price: 45, duration: 30 },
    { id: 6, name: "Coloração Cabelo", description: "Coloração completa", price: 250, duration: 150 },
    { id: 7, name: "Hidratação Capilar", description: "Hidratação profunda", price: 90, duration: 45 },
  ];

  return mock
    .filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
    )
    .slice(0, MAX_PER_TYPE)
    .map((s) => ({
      type: "service",
      id: s.id,
      title: s.name,
      subtitle: `${s.duration} min • ${formatCurrencyBRL(s.price)} • ${s.description}`,
      meta: { price: s.price, duration: s.duration, active: true },
      href: `/servicos/${s.id}`,
    }));
}

async function searchProfessionals(like, plain) {
  try {
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from("professionals")
        .select("id, name, phone, email, specialty, avatar_url, active")
        .or(`name.${likeOp}.${like},phone.${likeOp}.${like},email.${likeOp}.${like},specialty.${likeOp}.${like}`)
        .order("name", { ascending: true })
        .limit(MAX_PER_TYPE);

      return (data || []).map((p) => ({
        type: "professional",
        id: p.id,
        title: p.name,
        subtitle: [p.specialty, p.phone, p.email].filter(Boolean).join(" • "),
        meta: {
          specialty: p.specialty,
          active: p.active !== false,
        },
        avatar: p.avatar_url,
        href: `/profissionais/${p.id}`,
      }));
    }
  } catch (e) {
    console.warn("[search] professionals falhou:", e.message);
  }

  const q = plain.toLowerCase();
  const mock = [
    { id: 1, name: "Ana Silva", phone: "(11) 91111-1111", email: "ana@clinica.com", specialty: "Esteticista" },
    { id: 2, name: "Juliana Costa", phone: "(11) 92222-2222", email: "juliana@clinica.com", specialty: "Cabeleireira" },
    { id: 3, name: "Fernanda Lima", phone: "(11) 93333-3333", email: "fernanda@clinica.com", specialty: "Massagista" },
    { id: 4, name: "Camila Rocha", phone: "(11) 94444-4444", email: "camila@clinica.com", specialty: "Designer de Sobrancelhas" },
    { id: 5, name: "Patrícia Alves", phone: "(11) 95555-5555", email: "patricia@clinica.com", specialty: "Depiladora" },
  ];

  return mock
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(plain) ||
        p.email.toLowerCase().includes(q) ||
        (p.specialty && p.specialty.toLowerCase().includes(q))
    )
    .slice(0, MAX_PER_TYPE)
    .map((p) => ({
      type: "professional",
      id: p.id,
      title: p.name,
      subtitle: `${p.specialty} • ${p.phone} • ${p.email}`,
      meta: { specialty: p.specialty, active: true },
      href: `/profissionais/${p.id}`,
    }));
}
