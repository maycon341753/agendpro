const MOCK_CATEGORIES = [
  { id: 1, name: "Cabelo", description: "Serviços de corte, coloração e tratamentos capilares", order: 1, serviceCount: 8, status: "active", createdAt: new Date().toISOString() },
  { id: 2, name: "Estética", description: "Tratamentos estéticos faciais e corporais", order: 2, serviceCount: 5, status: "active", createdAt: new Date().toISOString() },
  { id: 3, name: "Manicure", description: "Unhas, esmaltação e nail art", order: 3, serviceCount: 4, status: "active", createdAt: new Date().toISOString() },
  { id: 4, name: "Pedicure", description: "Cuidados com os pés", order: 4, serviceCount: 3, status: "active", createdAt: new Date().toISOString() },
  { id: 5, name: "Depilação", description: "Depilação com cera, laser e linha", order: 5, serviceCount: 6, status: "inactive", createdAt: new Date().toISOString() },
];

export async function list(params = {}) {
  console.log("[categoryService] list", params);

  const { search = "", status = "", page = 1, limit = 50 } = params;

  let filtered = [...MOCK_CATEGORIES];

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter((c) => c.name.toLowerCase().includes(s) || c.description?.toLowerCase().includes(s));
  }

  if (status) {
    filtered = filtered.filter((c) => c.status === status);
  }

  filtered.sort((a, b) => a.order - b.order);

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

export async function listAll(params = {}) {
  const result = await list({ ...params, limit: 1000 });
  return result.data;
}

export async function get(id) {
  console.log("[categoryService] get", id);
  const cat = MOCK_CATEGORIES.find((c) => c.id === Number(id));
  return Promise.resolve(cat || { id: Number(id), name: "", description: "", order: 0, status: "active" });
}

export async function create(data) {
  console.log("[categoryService] create", data);
  return Promise.resolve({
    id: Date.now(),
    ...data,
    serviceCount: 0,
    status: data.status || "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function update(id, data) {
  console.log("[categoryService] update", { id, data });
  return Promise.resolve({
    id: Number(id),
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function remove(id) {
  console.log("[categoryService] remove", id);
  return Promise.resolve({ success: true, id: Number(id) });
}

export default {
  list,
  listAll,
  get,
  create,
  update,
  remove,
};
