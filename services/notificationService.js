export async function list(params = {}) {
  console.log("[notificationService] list", params);

  const {
    search = "",
    type = "",
    status = "",
    read = null,
    startDate = null,
    endDate = null,
    page = 1,
    limit = 20,
  } = params;

  return Promise.resolve({
    data: [
      {
        id: 1,
        type: "appointment_reminder",
        title: "Lembrete de Agendamento",
        message: "Seu agendamento com Ana Silva é amanhã às 14:00.",
        recipientType: "client",
        recipientId: 1,
        recipientName: "Maria Oliveira",
        channels: ["whatsapp", "email"],
        status: "sent",
        read: false,
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ],
    total: 89,
    page,
    limit,
    totalPages: Math.ceil(89 / limit),
    unreadCount: 12,
  });
}

export async function get(id) {
  console.log("[notificationService] get", id);

  return Promise.resolve({
    id,
    type: "appointment_reminder",
    title: "Lembrete de Agendamento",
    message: "Olá Maria! Seu agendamento com Ana Silva é amanhã às 14:00. Confirme sua presença.",
    recipientType: "client",
    recipientId: 1,
    recipientName: "Maria Oliveira",
    recipientPhone: "(11) 99999-9999",
    recipientEmail: "maria@email.com",
    channels: ["whatsapp", "email"],
    status: "sent",
    statusDetails: {
      whatsapp: { status: "delivered", deliveredAt: new Date().toISOString() },
      email: { status: "sent", sentAt: new Date().toISOString() },
    },
    read: false,
    readAt: null,
    referenceType: "appointment",
    referenceId: 1,
    metadata: {
      appointmentDate: new Date().toISOString(),
      professional: "Ana Silva",
      service: "Corte Feminino",
    },
    sentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function create(data) {
  console.log("[notificationService] create", data);

  return Promise.resolve({
    id: Date.now(),
    ...data,
    status: data.status || "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function update(id, data) {
  console.log("[notificationService] update", { id, data });

  return Promise.resolve({
    id,
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function remove(id) {
  console.log("[notificationService] remove", id);

  return Promise.resolve({ success: true, id });
}

export async function dispatchNotification(type, data, companyId) {
  console.log("[notificationService] dispatchNotification", { type, data, companyId });

  const notificationTypes = {
    appointment_created: {
      title: "Novo Agendamento",
      message: ({ clientName, date, professional, service }) =>
        `${clientName} agendou ${service} com ${professional} para ${date}.`,
      channels: ["whatsapp", "email"],
    },
    appointment_updated: {
      title: "Agendamento Atualizado",
      message: ({ clientName, date }) =>
        `Olá ${clientName}! Seu agendamento foi atualizado para ${date}.`,
      channels: ["whatsapp", "email"],
    },
    appointment_cancelled: {
      title: "Agendamento Cancelado",
      message: ({ clientName, date }) =>
        `${clientName} cancelou o agendamento de ${date}.`,
      channels: ["whatsapp", "email"],
    },
    appointment_reminder: {
      title: "Lembrete de Agendamento",
      message: ({ clientName, date, professional, service }) =>
        `Olá ${clientName}! Lembrete: ${service} com ${professional} em ${date}. Confirme sua presença.`,
      channels: ["whatsapp", "email"],
    },
    appointment_completed: {
      title: "Atendimento Concluído",
      message: ({ clientName, service }) =>
        `Obrigado ${clientName}! Esperamos que tenha gostado do(a) ${service}. Volte sempre!`,
      channels: ["whatsapp"],
    },
    payment_received: {
      title: "Pagamento Recebido",
      message: ({ amount, paymentMethod }) =>
        `Pagamento de ${amount} recebido via ${paymentMethod}. Obrigado!`,
      channels: ["whatsapp", "email"],
    },
    welcome_client: {
      title: "Bem-vindo!",
      message: ({ name }) => `Olá ${name}! Bem-vindo(a) ao nosso studio. Estamos felizes em tê-lo(a)!`,
      channels: ["whatsapp", "email"],
    },
    birthday: {
      title: "Feliz Aniversário!",
      message: ({ name }) => `Feliz aniversário, ${name}! 🎉 Venha celebrar conosco e ganhe 15% de desconto!`,
      channels: ["whatsapp"],
    },
  };

  const template = notificationTypes[type] || notificationTypes.appointment_created;
  const message = typeof template.message === "function"
    ? template.message(data)
    : template.message;

  return Promise.resolve({
    id: Date.now(),
    type,
    companyId,
    title: template.title,
    message,
    channels: template.channels,
    recipientId: data.clientId || data.recipientId || null,
    status: "queued",
    dispatchedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });
}

export async function markAsRead(notificationId) {
  console.log("[notificationService] markAsRead", notificationId);

  return Promise.resolve({
    id: notificationId,
    read: true,
    readAt: new Date().toISOString(),
  });
}

export async function markAllAsRead(userId) {
  console.log("[notificationService] markAllAsRead", userId);

  return Promise.resolve({ success: true, markedCount: 12 });
}

export default {
  list,
  get,
  create,
  update,
  remove,
  dispatchNotification,
  markAsRead,
  markAllAsRead,
};
