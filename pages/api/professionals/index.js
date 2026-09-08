const MOCK_PROFESSIONALS = [
  { id: 1, name: "Ana Silva", email: "ana@email.com", phone: "(11) 98888-8888", role: "Cabeleireiro(a)", color: "#ec4899", avatar: null, commissionType: "percentage", commissionValue: 30, status: "active", totalAppointments: 68, totalRevenue: 8500.0, createdAt: new Date().toISOString() },
  { id: 2, name: "Maria Santos", email: "maria@email.com", phone: "(11) 97777-7777", role: "Manicure", color: "#8b5cf6", avatar: null, commissionType: "percentage", commissionValue: 25, status: "active", totalAppointments: 52, totalRevenue: 4200.0, createdAt: new Date().toISOString() },
  { id: 3, name: "Joana Oliveira", email: "joana@email.com", phone: "(11) 96666-6666", role: "Esteticista", color: "#10b981", avatar: null, commissionType: "fixed", commissionValue: 50, status: "active", totalAppointments: 34, totalRevenue: 6700.0, createdAt: new Date().toISOString() },
  { id: 4, name: "Carla Souza", email: "carla@email.com", phone: "(11) 95555-5555", role: "Depilador(a)", color: "#f59e0b", avatar: null, commissionType: "percentage", commissionValue: 35, status: "inactive", totalAppointments: 12, totalRevenue: 1800.0, createdAt: new Date().toISOString() },
];

export default async function handler(req, res) {
  console.log("[api/professionals]", req.method, req.query, req.body);

  if (req.method === "GET") {
    const { search = "", status = "", serviceId = null, page = 1, limit = 20 } = req.query;

    let filtered = [...MOCK_PROFESSIONALS];

    if (search) {
      const s = String(search).toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(s) ||
        p.email?.toLowerCase().includes(s) ||
        p.phone?.includes(s) ||
        p.role?.toLowerCase().includes(s)
      );
    }

    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    const p = Number(page);
    const l = Number(limit);
    const total = filtered.length;
    const start = (p - 1) * l;
    const data = filtered.slice(start, start + l);

    return Promise.resolve().then(() => {
      res.status(200).json({
        success: true,
        data,
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      });
    });
  }

  if (req.method === "POST") {
    const data = req.body || {};
    const created = {
      id: Date.now(),
      ...data,
      status: data.status || "active",
      totalAppointments: 0,
      totalRevenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return Promise.resolve().then(() => {
      res.status(201).json({
        success: true,
        data: created,
      });
    });
  }

  return Promise.resolve().then(() => {
    res.status(405).json({ success: false, message: "Method not allowed" });
  });
}
