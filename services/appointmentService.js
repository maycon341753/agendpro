export async function list(params = {}) {
  console.log("[appointmentService] list", params);

  const {
    search = "",
    status = "",
    startDate = null,
    endDate = null,
    professionalId = null,
    clientId = null,
    serviceId = null,
    page = 1,
    limit = 20,
  } = params;

  return Promise.resolve({
    data: [
      {
        id: 1,
        clientId: 1,
        clientName: "Maria Oliveira",
        professionalId: 1,
        professionalName: "Ana Silva",
        serviceId: 1,
        serviceName: "Corte Feminino",
        start: new Date().toISOString(),
        end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        status: "confirmed",
        notes: "",
        totalPrice: 100.0,
        paymentMethod: "pix",
        paid: true,
        createdAt: new Date().toISOString(),
      },
    ],
    total: 156,
    page,
    limit,
    totalPages: Math.ceil(156 / limit),
  });
}

export async function get(id) {
  console.log("[appointmentService] get", id);

  return Promise.resolve({
    id,
    clientId: 1,
    clientName: "Maria Oliveira",
    clientPhone: "(11) 99999-9999",
    professionalId: 1,
    professionalName: "Ana Silva",
    serviceId: 1,
    serviceName: "Corte Feminino",
    serviceDuration: 60,
    start: new Date().toISOString(),
    end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    status: "confirmed",
    notes: "Cliente é alérgica a certos produtos.",
    totalPrice: 100.0,
    paymentMethod: "pix",
    paid: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function create(data) {
  console.log("[appointmentService] create", data);

  return Promise.resolve({
    id: Date.now(),
    ...data,
    status: data.status || "pending",
    paid: data.paid || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function update(id, data) {
  console.log("[appointmentService] update", { id, data });

  return Promise.resolve({
    id,
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function remove(id) {
  console.log("[appointmentService] remove", id);

  return Promise.resolve({ success: true, id });
}

export default {
  list,
  get,
  create,
  update,
  remove,
};
