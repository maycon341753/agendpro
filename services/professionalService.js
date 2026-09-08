export async function list(params = {}) {
  console.log("[professionalService] list", params);

  const {
    search = "",
    status = "",
    serviceId = null,
    page = 1,
    limit = 20,
  } = params;

  return Promise.resolve({
    data: [
      {
        id: 1,
        name: "Ana Silva",
        email: "ana@email.com",
        phone: "(11) 98888-8888",
        cpf: "987.654.321-00",
        role: "Cabeleireira",
        color: "#ec4899",
        avatar: null,
        status: "active",
        totalAppointments: 68,
        totalRevenue: 8500.0,
        createdAt: new Date().toISOString(),
      },
    ],
    total: 12,
    page,
    limit,
    totalPages: Math.ceil(12 / limit),
  });
}

export async function get(id) {
  console.log("[professionalService] get", id);

  return Promise.resolve({
    id,
    name: "Ana Silva",
    email: "ana@email.com",
    phone: "(11) 98888-8888",
    cpf: "987.654.321-00",
    rg: "98.765.432-1",
    birthDate: "1988-03-20",
    role: "Cabeleireira Principal",
    color: "#ec4899",
    avatar: null,
    address: "Rua dos Profissionais, 456",
    city: "São Paulo",
    state: "SP",
    zipCode: "04567-890",
    admissionDate: "2022-01-15",
    salary: 3500.0,
    commissionType: "percentage",
    commissionValue: 30,
    notes: "Especialista em coloração e mechas.",
    status: "active",
    services: [
      { id: 1, name: "Corte Feminino" },
      { id: 2, name: "Escova Progressiva" },
      { id: 4, name: "Coloração" },
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
    totalAppointments: 68,
    totalRevenue: 8500.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function create(data) {
  console.log("[professionalService] create", data);

  return Promise.resolve({
    id: Date.now(),
    ...data,
    status: data.status || "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function update(id, data) {
  console.log("[professionalService] update", { id, data });

  return Promise.resolve({
    id,
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function remove(id) {
  console.log("[professionalService] remove", id);

  return Promise.resolve({ success: true, id });
}

export default {
  list,
  get,
  create,
  update,
  remove,
};
