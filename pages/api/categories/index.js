const MOCK_CATEGORIES = [
  { id: 1, name: "Cabelo", description: "Serviços de corte, coloração e tratamentos capilares", order: 1, serviceCount: 8, status: "active", createdAt: new Date().toISOString() },
  { id: 2, name: "Estética", description: "Tratamentos estéticos faciais e corporais", order: 2, serviceCount: 5, status: "active", createdAt: new Date().toISOString() },
  { id: 3, name: "Manicure", description: "Unhas, esmaltação e nail art", order: 3, serviceCount: 4, status: "active", createdAt: new Date().toISOString() },
  { id: 4, name: "Pedicure", description: "Cuidados com os pés", order: 4, serviceCount: 3, status: "active", createdAt: new Date().toISOString() },
  { id: 5, name: "Depilação", description: "Depilação com cera, laser e linha", order: 5, serviceCount: 6, status: "inactive", createdAt: new Date().toISOString() },
];

export default async function handler(req, res) {
  console.log("[api/categories]", req.method, req.query, req.body);

  if (req.method === "GET") {
    const { search = "", status = "", page = 1, limit = 50 } = req.query;

    let filtered = [...MOCK_CATEGORIES];

    if (search) {
      const s = String(search).toLowerCase();
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(s) ||
        c.description?.toLowerCase().includes(s)
      );
    }

    if (status) {
      filtered = filtered.filter((c) => c.status === status);
    }

    filtered.sort((a, b) => a.order - b.order);

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
      serviceCount: 0,
      status: data.status || "active",
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
