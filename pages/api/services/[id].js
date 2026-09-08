const MOCK_SERVICE = {
  id: 1,
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
  status: "active",
  professionals: [{ id: 1, name: "Ana Silva" }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default async function handler(req, res) {
  const { id } = req.query;
  console.log(`[api/services/${id}]`, req.method, req.body);

  if (req.method === "GET") {
    return Promise.resolve().then(() => {
      res.status(200).json({
        success: true,
        data: {
          ...MOCK_SERVICE,
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
          ...MOCK_SERVICE,
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
        message: "Serviço inativado com sucesso (soft delete)",
        data: { id: Number(id), status: "inactive", deletedAt: new Date().toISOString() },
      });
    });
  }

  return Promise.resolve().then(() => {
    res.status(405).json({ success: false, message: "Method not allowed" });
  });
}
