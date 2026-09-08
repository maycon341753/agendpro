export async function list(params = {}) {
  console.log("[reportService] list", params);

  const {
    search = "",
    type = "",
    startDate = null,
    endDate = null,
    page = 1,
    limit = 20,
  } = params;

  return Promise.resolve({
    data: [
      {
        id: 1,
        name: "Relatório de Vendas - Setembro/2024",
        type: "sales",
        generatedAt: new Date().toISOString(),
        generatedBy: "Admin",
        fileUrl: null,
        filters: { startDate, endDate },
        summary: { totalSales: 156, totalRevenue: 28500.0, avgTicket: 182.75 },
      },
    ],
    total: 24,
    page,
    limit,
    totalPages: Math.ceil(24 / limit),
  });
}

export async function get(id) {
  console.log("[reportService] get", id);

  return Promise.resolve({
    id,
    name: "Relatório de Vendas - Setembro/2024",
    type: "sales",
    description: "Relatório detalhado de vendas com filtros por período.",
    generatedAt: new Date().toISOString(),
    generatedBy: "Admin",
    generatedById: 1,
    fileUrl: null,
    format: "pdf",
    filters: {
      startDate: "2024-09-01",
      endDate: "2024-09-30",
      professionalId: null,
      clientId: null,
      paymentMethod: null,
    },
    summary: {
      totalSales: 156,
      totalRevenue: 28500.0,
      totalDiscount: 1200.0,
      totalTax: 0,
      netRevenue: 27300.0,
      avgTicket: 182.75,
      paymentMethods: {
        dinheiro: 23,
        pix: 68,
        debito: 25,
        credito: 35,
        convenio: 3,
        outros: 2,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function create(data) {
  console.log("[reportService] create", data);

  return Promise.resolve({
    id: Date.now(),
    ...data,
    generatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function update(id, data) {
  console.log("[reportService] update", { id, data });

  return Promise.resolve({
    id,
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function remove(id) {
  console.log("[reportService] remove", id);

  return Promise.resolve({ success: true, id });
}

export async function generateReport(type, filters = {}) {
  console.log("[reportService] generateReport", { type, filters });

  return Promise.resolve({
    id: Date.now(),
    type,
    filters,
    generatedAt: new Date().toISOString(),
    status: "processing",
    progress: 0,
  });
}

export async function exportReport(id, format = "pdf") {
  console.log("[reportService] exportReport", { id, format });

  return Promise.resolve({
    id,
    format,
    downloadUrl: `/api/reports/${id}/download.${format}`,
    ready: true,
  });
}

export default {
  list,
  get,
  create,
  update,
  remove,
  generateReport,
  exportReport,
};
