const MOCK_PROFESSIONAL = {
  id: 1,
  name: "Ana Silva",
  email: "ana@email.com",
  phone: "(11) 98888-8888",
  role: "Cabeleireiro(a) Principal",
  color: "#ec4899",
  avatar: null,
  commissionType: "percentage",
  commissionValue: 30,
  status: "active",
  services: [
    { id: 1, name: "Corte Feminino" },
    { id: 2, name: "Escova Progressiva" },
    { id: 4, name: "Mechas" },
  ],
  workHours: {
    0: { enabled: false, openTime: "", closeTime: "", breakStart: "", breakEnd: "" },
    1: { enabled: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
    2: { enabled: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
    3: { enabled: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
    4: { enabled: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
    5: { enabled: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
    6: { enabled: true, openTime: "09:00", closeTime: "13:00", breakStart: "", breakEnd: "" },
  },
  scheduleBlocks: [],
  totalAppointments: 68,
  totalRevenue: 8500.0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default async function handler(req, res) {
  const { id } = req.query;
  console.log(`[api/professionals/${id}]`, req.method, req.body);

  if (req.method === "GET") {
    return Promise.resolve().then(() => {
      res.status(200).json({
        success: true,
        data: {
          ...MOCK_PROFESSIONAL,
          id: Number(id),
        },
      });
    });
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const data = req.body || {};
    return Promise.resolve().then(() => {
      res.status(200).json({
        success: true,
        data: {
          ...MOCK_PROFESSIONAL,
          id: Number(id),
          ...data,
          updatedAt: new Date().toISOString(),
        },
      });
    });
  }

  if (req.method === "DELETE") {
    return Promise.resolve().then(() => {
      res.status(200).json({
        success: true,
        message: "Profissional inativado com sucesso (soft delete)",
        data: { id: Number(id), status: "inactive", deletedAt: new Date().toISOString() },
      });
    });
  }

  return Promise.resolve().then(() => {
    res.status(405).json({ success: false, message: "Method not allowed" });
  });
}
