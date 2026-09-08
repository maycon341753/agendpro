export async function list(params = {}) {
  console.log("[clientService] list", params);

  const {
    search = "",
    status = "",
    startDate = null,
    endDate = null,
    page = 1,
    limit = 20,
  } = params;

  return Promise.resolve({
    data: [
      {
        id: 1,
        name: "Maria Oliveira",
        email: "maria@email.com",
        phone: "(11) 99999-9999",
        cpf: "123.456.789-09",
        birthDate: "1990-05-15",
        address: "Rua das Flores, 123",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567",
        notes: "Cliente VIP, alérgica a amônia",
        totalAppointments: 24,
        totalSpent: 4500.0,
        lastVisit: new Date().toISOString(),
        status: "active",
        createdAt: new Date().toISOString(),
      },
    ],
    total: 192,
    page,
    limit,
    totalPages: Math.ceil(192 / limit),
  });
}

export async function get(id) {
  console.log("[clientService] get", id);

  return Promise.resolve({
    id,
    name: "Maria Oliveira",
    email: "maria@email.com",
    phone: "(11) 99999-9999",
    cpf: "123.456.789-09",
    rg: "12.345.678-9",
    birthDate: "1990-05-15",
    gender: "F",
    address: "Rua das Flores, 123",
    number: "123",
    complement: "Apto 45",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567",
    notes: "Cliente VIP, alérgica a amônia. Prefere atendimento às terças-feiras.",
    avatar: null,
    totalAppointments: 24,
    totalSpent: 4500.0,
    lastVisit: new Date().toISOString(),
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function create(data) {
  console.log("[clientService] create", data);

  return Promise.resolve({
    id: Date.now(),
    ...data,
    status: data.status || "active",
    totalAppointments: 0,
    totalSpent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function update(id, data) {
  console.log("[clientService] update", { id, data });

  return Promise.resolve({
    id,
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function remove(id) {
  console.log("[clientService] remove", id);

  return Promise.resolve({ success: true, id });
}

export default {
  list,
  get,
  create,
  update,
  remove,
};
