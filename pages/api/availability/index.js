import { getAvailableSlots } from "@/lib/availability";

const DEFAULT_COMPANY_HOURS = {
  0: { enabled: false, openTime: "", closeTime: "", breakStart: "", breakEnd: "" },
  1: { enabled: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
  2: { enabled: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
  3: { enabled: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
  4: { enabled: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
  5: { enabled: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
  6: { enabled: true, openTime: "09:00", closeTime: "13:00", breakStart: "", breakEnd: "" },
};

const DEFAULT_PROFESSIONAL_HOURS = { ...DEFAULT_COMPANY_HOURS };

const MOCK_HOLIDAYS = [
  { date: new Date(new Date().getFullYear(), 0, 1).toISOString(), name: "Ano Novo" },
  { date: new Date(new Date().getFullYear(), 8, 7).toISOString(), name: "Independência" },
  { date: new Date(new Date().getFullYear(), 11, 25).toISOString(), name: "Natal" },
];

const MOCK_APPOINTMENTS = [];
const MOCK_BLOCKS = [];

export default async function handler(req, res) {
  console.log("[api/availability]", req.method, req.query, req.body);

  if (req.method !== "GET") {
    return Promise.resolve().then(() => {
      res.status(405).json({ success: false, message: "Method not allowed" });
    });
  }

  const {
    companyId = "default",
    serviceId = null,
    professionalId = null,
    date = new Date().toISOString().split("T")[0],
    interval = 30,
  } = req.query;

  const serviceDuration = serviceId
    ? Number(serviceId) === 1
      ? 60
      : Number(serviceId) === 2
      ? 180
      : Number(interval)
    : Number(interval);

  try {
    const slots = getAvailableSlots({
      companyHours: DEFAULT_COMPANY_HOURS,
      professionalHours: professionalId ? DEFAULT_PROFESSIONAL_HOURS : null,
      holidays: MOCK_HOLIDAYS,
      blocks: MOCK_BLOCKS,
      appointments: MOCK_APPOINTMENTS,
      serviceDuration,
      date,
      intervalMinutes: Number(interval),
    });

    return Promise.resolve().then(() => {
      res.status(200).json({
        success: true,
        data: {
          slots,
          date,
          interval: Number(interval),
          serviceDuration,
          companyId,
          serviceId: serviceId ? Number(serviceId) : null,
          professionalId: professionalId ? Number(professionalId) : null,
          meta: {
            totalSlots: slots.length,
            generatedAt: new Date().toISOString(),
          },
        },
      });
    });
  } catch (err) {
    console.error("[api/availability] error:", err);
    return Promise.resolve().then(() => {
      res.status(500).json({
        success: false,
        message: "Erro ao calcular horários disponíveis",
        error: err.message,
      });
    });
  }
}
