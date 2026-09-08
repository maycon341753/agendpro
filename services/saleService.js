export async function list(params = {}) {
  console.log("[saleService] list", params);

  const {
    search = "",
    status = "",
    startDate = null,
    endDate = null,
    paymentMethod = "",
    clientId = null,
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
        appointmentId: 1,
        items: [
          { id: 1, type: "service", name: "Corte Feminino", quantity: 1, unitPrice: 100.0, total: 100.0 },
        ],
        subtotal: 100.0,
        discount: 0,
        tax: 0,
        total: 100.0,
        paymentMethod: "pix",
        paid: true,
        paidAt: new Date().toISOString(),
        notes: "",
        createdAt: new Date().toISOString(),
      },
    ],
    total: 145,
    page,
    limit,
    totalPages: Math.ceil(145 / limit),
  });
}

export async function get(id) {
  console.log("[saleService] get", id);

  return Promise.resolve({
    id,
    clientId: 1,
    clientName: "Maria Oliveira",
    clientPhone: "(11) 99999-9999",
    professionalId: 1,
    professionalName: "Ana Silva",
    appointmentId: 1,
    items: [
      {
        id: 1,
        type: "service",
        referenceId: 1,
        name: "Corte Feminino",
        description: "Corte + Lavagem + Finalização",
        quantity: 1,
        unitPrice: 100.0,
        discount: 0,
        total: 100.0,
        commissionType: "percentage",
        commissionValue: 30,
        professionalCommission: 30.0,
      },
    ],
    subtotal: 100.0,
    discount: 0,
    discountType: null,
    couponId: null,
    tax: 0,
    serviceFee: 0,
    total: 100.0,
    paymentMethod: "pix",
    installments: 1,
    paid: true,
    paidAt: new Date().toISOString(),
    status: "completed",
    notes: "Pagamento realizado via QR Code PIX.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function create(data) {
  console.log("[saleService] create", data);

  return Promise.resolve({
    id: Date.now(),
    ...data,
    status: data.status || "completed",
    paid: data.paid ?? true,
    paidAt: data.paid ? new Date().toISOString() : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function update(id, data) {
  console.log("[saleService] update", { id, data });

  return Promise.resolve({
    id,
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function remove(id) {
  console.log("[saleService] remove", id);

  return Promise.resolve({ success: true, id });
}

export default {
  list,
  get,
  create,
  update,
  remove,
};
