const MOCK_BLOCKS = [
  {
    id: 1,
    type: "full_day",
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    startTime: null,
    endTime: null,
    professionalId: null,
    professionalName: "Todos",
    reason: "feriado",
    reasonLabel: "Feriado Nacional",
    notes: "Dia da Independência",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    type: "period",
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    startTime: null,
    endTime: null,
    professionalId: 1,
    professionalName: "Ana Silva",
    reason: "ferias",
    reasonLabel: "Férias",
    notes: "Férias anuais",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    type: "time_range",
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    startTime: "14:00",
    endTime: "16:00",
    professionalId: 2,
    professionalName: "Maria Santos",
    reason: "reuniao",
    reasonLabel: "Reunião",
    notes: "Reunião com fornecedor",
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    type: "full_day",
    startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    startTime: null,
    endTime: null,
    professionalId: null,
    professionalName: "Todos",
    reason: "manutencao",
    reasonLabel: "Manutenção",
    notes: "Manutenção do ar-condicionado",
    createdAt: new Date().toISOString(),
  },
];

const BLOCK_TYPES = [
  { value: "full_day", label: "Dia inteiro" },
  { value: "time_range", label: "Horário específico" },
  { value: "period", label: "Período" },
];

const BLOCK_REASONS = [
  { value: "feriado", label: "Feriado" },
  { value: "reuniao", label: "Reunião" },
  { value: "manutencao", label: "Manutenção" },
  { value: "folga", label: "Folga" },
  { value: "ferias", label: "Férias" },
  { value: "outro", label: "Outro" },
];

export function getBlockTypes() {
  return BLOCK_TYPES;
}

export function getBlockReasons() {
  return BLOCK_REASONS;
}

export function getReasonLabel(value) {
  const r = BLOCK_REASONS.find((x) => x.value === value);
  return r?.label || value;
}

export function getTypeLabel(value) {
  const t = BLOCK_TYPES.find((x) => x.value === value);
  return t?.label || value;
}

export async function list(params = {}) {
  console.log("[scheduleBlockService] list", params);

  const { search = "", professionalId = null, page = 1, limit = 20 } = params;

  let filtered = [...MOCK_BLOCKS];

  if (professionalId) {
    if (professionalId === "all") {
      filtered = filtered.filter((b) => b.professionalId === null);
    } else {
      filtered = filtered.filter((b) => b.professionalId === Number(professionalId) || b.professionalId === null);
    }
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.reasonLabel?.toLowerCase().includes(s) ||
        b.notes?.toLowerCase().includes(s) ||
        b.professionalName?.toLowerCase().includes(s)
    );
  }

  filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return Promise.resolve({
    data: paginated,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit),
  });
}

export async function listForCalendar(params = {}) {
  const { startDate, endDate, professionalId = null } = params;
  let data = [...MOCK_BLOCKS];

  if (professionalId) {
    data = data.filter((b) => b.professionalId === null || b.professionalId === Number(professionalId));
  }

  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    data = data.filter((b) => {
      const bs = new Date(b.startDate);
      const be = new Date(b.endDate);
      return be >= s && bs <= e;
    });
  }

  return Promise.resolve(data);
}

export async function get(id) {
  console.log("[scheduleBlockService] get", id);
  const block = MOCK_BLOCKS.find((b) => b.id === Number(id));
  return Promise.resolve(block || null);
}

export async function create(data) {
  console.log("[scheduleBlockService] create", data);
  return Promise.resolve({
    id: Date.now(),
    ...data,
    reasonLabel: getReasonLabel(data.reason),
    createdAt: new Date().toISOString(),
  });
}

export async function remove(id) {
  console.log("[scheduleBlockService] remove", id);
  return Promise.resolve({ success: true, id: Number(id) });
}

export default {
  list,
  listForCalendar,
  get,
  create,
  remove,
  getBlockTypes,
  getBlockReasons,
  getReasonLabel,
  getTypeLabel,
};
