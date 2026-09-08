const MOCK_SERVICES = [
  { id: 1, name: "Corte Feminino", description: "Corte personalizado com lavagem e finalização", category: "Cabelo", categoryId: 1, duration: 60, price: 100.0, color: "#ec4899", image: null, status: "active", createdAt: new Date().toISOString() },
  { id: 2, name: "Escova Progressiva", description: "Tratamento com formol ou orgânico", category: "Cabelo", categoryId: 1, duration: 180, price: 350.0, color: "#ec4899", image: null, status: "active", createdAt: new Date().toISOString() },
  { id: 3, name: "Coloração Completa", description: "Tintura completa com retoque", category: "Cabelo", categoryId: 1, duration: 120, price: 180.0, color: "#ec4899", image: null, status: "active", createdAt: new Date().toISOString() },
  { id: 4, name: "Mechas", description: "Mechas com luzes", category: "Cabelo", categoryId: 1, duration: 150, price: 220.0, color: "#ec4899", image: null, status: "active", createdAt: new Date().toISOString() },
  { id: 5, name: "Limpeza de Pele", description: "Limpeza profunda com extração", category: "Estética", categoryId: 2, duration: 90, price: 150.0, color: "#8b5cf6", image: null, status: "active", createdAt: new Date().toISOString() },
  { id: 6, name: "Hidratação Facial", description: "Tratamento hidratante", category: "Estética", categoryId: 2, duration: 60, price: 120.0, color: "#8b5cf6", image: null, status: "active", createdAt: new Date().toISOString() },
  { id: 7, name: "Manicure Tradicional", description: "Corte, lixa e esmaltação", category: "Manicure", categoryId: 3, duration: 45, price: 45.0, color: "#f59e0b", image: null, status: "active", createdAt: new Date().toISOString() },
  { id: 8, name: "Pedicure", description: "Pedicure completa com esmaltação", category: "Pedicure", categoryId: 4, duration: 60, price: 65.0, color: "#10b981", image: null, status: "active", createdAt: new Date().toISOString() },
  { id: 9, name: "Massagem Relaxante", description: "Massagem corporal completa", category: "Estética", categoryId: 2, duration: 90, price: 180.0, color: "#8b5cf6", image: null, status: "inactive", createdAt: new Date().toISOString() },
];

export default async function handler(req, res) {
  console.log("[api/services]", req.method, req.query, req.body);

  if (req.method === "GET") {
    const { search = "", status = "", categoryId = null, page = 1, limit = 20 } = req.query;

    let filtered = [...MOCK_SERVICES];

    if (search) {
      const s = String(search).toLowerCase();
      filtered = filtered.filter((x) =>
        x.name.toLowerCase().includes(s) ||
        x.description?.toLowerCase().includes(s)
      );
    }

    if (status) {
      filtered = filtered.filter((x) => x.status === status);
    }

    if (categoryId) {
      const cid = Number(categoryId);
      filtered = filtered.filter((x) => x.categoryId === cid);
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
