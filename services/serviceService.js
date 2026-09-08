export async function list(params = {}) {
  console.log("[serviceService] list", params);

  const {
    search = "",
    status = "",
    categoryId = null,
    page = 1,
    limit = 20,
  } = params;

  return Promise.resolve({
    data: [
      {
        id: 1,
        name: "Corte Feminino",
        description: "Corte personalizado com lavagem e finalização",
        category: "Cabelo",
        categoryId: 1,
        duration: 60,
        price: 100.0,
        costPrice: 20.0,
        commissionType: "percentage",
        commissionValue: 30,
        color: "#ec4899",
        image: null,
        status: "active",
        createdAt: new Date().toISOString(),
      },
    ],
    total: 35,
    page,
    limit,
    totalPages: Math.ceil(35 / limit),
  });
}

export async function get(id) {
  console.log("[serviceService] get", id);

  return Promise.resolve({
    id,
    name: "Corte Feminino",
    description: "Corte personalizado com lavagem e finalização incluída.",
    category: "Cabelo",
    categoryId: 1,
    duration: 60,
    price: 100.0,
    costPrice: 20.0,
    commissionType: "percentage",
    commissionValue: 30,
    color: "#ec4899",
    image: null,
    bufferTimeBefore: 0,
    bufferTimeAfter: 0,
    maxPerDay: null,
    requiresProfessional: true,
    isOnlineBooking: true,
    status: "active",
    professionals: [
      { id: 1, name: "Ana Silva" },
      { id: 2, name: "Maria Santos" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function create(data) {
  console.log("[serviceService] create", data);

  return Promise.resolve({
    id: Date.now(),
    ...data,
    status: data.status || "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function update(id, data) {
  console.log("[serviceService] update", { id, data });

  return Promise.resolve({
    id,
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function remove(id) {
  console.log("[serviceService] remove", id);

  return Promise.resolve({ success: true, id });
}

export default {
  list,
  get,
  create,
  update,
  remove,
};
