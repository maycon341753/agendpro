export const APPOINTMENT_STATUS = {
  pending: {
    value: "pending",
    label: "Pendente",
    color: "#f59e0b",
    bgColor: "#fef3c7",
  },
  confirmed: {
    value: "confirmed",
    label: "Confirmado",
    color: "#3b82f6",
    bgColor: "#dbeafe",
  },
  in_progress: {
    value: "in_progress",
    label: "Em Atendimento",
    color: "#8b5cf6",
    bgColor: "#ede9fe",
  },
  completed: {
    value: "completed",
    label: "Concluído",
    color: "#10b981",
    bgColor: "#d1fae5",
  },
  cancelled: {
    value: "cancelled",
    label: "Cancelado",
    color: "#ef4444",
    bgColor: "#fee2e2",
  },
  no_show: {
    value: "no_show",
    label: "Não Compareceu",
    color: "#6b7280",
    bgColor: "#f3f4f6",
  },
};

export const BUSINESS_TYPES = [
  { value: "clinica", label: "Clínica" },
  { value: "salao_beleza", label: "Salão de Beleza" },
  { value: "barbearia", label: "Barbearia" },
  { value: "cabeleireiro", label: "Cabeleireiro" },
  { value: "estetica", label: "Estética" },
  { value: "odontologia", label: "Odontologia" },
  { value: "restaurante", label: "Restaurante" },
  { value: "hamburgueria", label: "Hamburgueria" },
  { value: "outro", label: "Outro" },
];

export const PAYMENT_METHODS = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "debito", label: "Cartão de Débito" },
  { value: "credito", label: "Cartão de Crédito" },
  { value: "convenio", label: "Convênio" },
  { value: "outros", label: "Outros" },
];

export const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo", shortLabel: "Dom" },
  { value: 1, label: "Segunda-feira", shortLabel: "Seg" },
  { value: 2, label: "Terça-feira", shortLabel: "Ter" },
  { value: 3, label: "Quarta-feira", shortLabel: "Qua" },
  { value: 4, label: "Quinta-feira", shortLabel: "Qui" },
  { value: 5, label: "Sexta-feira", shortLabel: "Sex" },
  { value: 6, label: "Sábado", shortLabel: "Sáb" },
];

export const PERIOD_PRESETS = {
  hoje: {
    value: "hoje",
    label: "Hoje",
    getRange: () => {
      const today = new Date();
      const start = new Date(today.setHours(0, 0, 0, 0));
      const end = new Date(today.setHours(23, 59, 59, 999));
      return { start, end };
    },
  },
  ontem: {
    value: "ontem",
    label: "Ontem",
    getRange: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const start = new Date(yesterday.setHours(0, 0, 0, 0));
      const end = new Date(yesterday.setHours(23, 59, 59, 999));
      return { start, end };
    },
  },
  ultimos_7d: {
    value: "ultimos_7d",
    label: "Últimos 7 dias",
    getRange: () => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    },
  },
  ultimos_30d: {
    value: "ultimos_30d",
    label: "Últimos 30 dias",
    getRange: () => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    },
  },
  este_mes: {
    value: "este_mes",
    label: "Este mês",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
  mes_anterior: {
    value: "mes_anterior",
    label: "Mês anterior",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
};

export default {
  APPOINTMENT_STATUS,
  BUSINESS_TYPES,
  PAYMENT_METHODS,
  DAYS_OF_WEEK,
  PERIOD_PRESETS,
};
