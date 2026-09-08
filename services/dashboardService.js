export async function getKPIs(companyId, { startDate, endDate } = {}) {
  console.log("[dashboardService] getKPIs", { companyId, startDate, endDate });

  return Promise.resolve({
    revenueToday: 1250.0,
    revenueMonth: 28500.0,
    appointmentsToday: 8,
    appointmentsMonth: 156,
    servicesDone: 142,
    newCustomers: 23,
    activeCustomers: 187,
    avgTicket: 182.75,
    cancellationRate: 4.5,
    occupancyRate: 72.3,
  });
}

export async function getRevenueChartData(companyId, range = "day") {
  console.log("[dashboardService] getRevenueChartData", { companyId, range });

  const mockData = [];
  const days = range === "month" ? 30 : range === "week" ? 7 : 14;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    mockData.push({
      date: date.toISOString().split("T")[0],
      revenue: Math.floor(Math.random() * 2000) + 500,
    });
  }

  return Promise.resolve(mockData);
}

export async function getAppointmentsByStatus(companyId, range) {
  console.log("[dashboardService] getAppointmentsByStatus", { companyId, range });

  return Promise.resolve({
    pending: 12,
    confirmed: 45,
    in_progress: 3,
    completed: 87,
    cancelled: 9,
    no_show: 5,
  });
}

export async function getTopServices(companyId, range, limit = 5) {
  console.log("[dashboardService] getTopServices", { companyId, range, limit });

  return Promise.resolve([
    { id: 1, name: "Corte Feminino", count: 42, revenue: 4200.0 },
    { id: 2, name: "Escova Progressiva", count: 28, revenue: 5600.0 },
    { id: 3, name: "Hidratação", count: 35, revenue: 2625.0 },
    { id: 4, name: "Coloração", count: 19, revenue: 3800.0 },
    { id: 5, name: "Manicure", count: 51, revenue: 2550.0 },
  ]);
}

export async function getTopProfessionals(companyId, range, limit = 5) {
  console.log("[dashboardService] getTopProfessionals", { companyId, range, limit });

  return Promise.resolve([
    { id: 1, name: "Ana Silva", count: 68, revenue: 8500.0, avatar: null },
    { id: 2, name: "Maria Santos", count: 54, revenue: 7200.0, avatar: null },
    { id: 3, name: "João Pereira", count: 41, revenue: 5800.0, avatar: null },
    { id: 4, name: "Carla Lima", count: 38, revenue: 4900.0, avatar: null },
    { id: 5, name: "Pedro Costa", count: 29, revenue: 3600.0, avatar: null },
  ]);
}

export async function getCustomersBreakdown(companyId, range) {
  console.log("[dashboardService] getCustomersBreakdown", { companyId, range });

  return Promise.resolve({
    newCustomers: 23,
    recurring: 124,
    inactive: 45,
    total: 192,
  });
}

export async function getInsights(companyId) {
  console.log("[dashboardService] getInsights", { companyId });

  const insights = [
    "Seu faturamento desta semana cresceu 15% em comparação com a semana passada. Continue assim!",
    "A taxa de cancelamento está abaixo da média do seu ramo. Bom trabalho!",
    "O serviço 'Escova Progressiva' tem maior margem de lucro. Considere promovê-lo.",
    "Ana Silva é a profissional com maior taxa de ocupação (94%). Parabéns à equipe!",
    "3 clientes são fiéis há mais de 1 ano. Que tal enviar um desconto especial de fidelidade?",
    "Sexta-feira é o dia mais movimentado. Considere ajustar a escala de funcionários.",
    "Clientes que fazem coloração têm 40% mais chance de contratar hidratação no mesmo dia.",
    "O horário de pico é entre 14h e 17h. Sugerimos disponibilizar mais profissionais neste período.",
  ];

  const shuffled = insights.sort(() => 0.5 - Math.random());
  return Promise.resolve(shuffled.slice(0, 5));
}

export default {
  getKPIs,
  getRevenueChartData,
  getAppointmentsByStatus,
  getTopServices,
  getTopProfessionals,
  getCustomersBreakdown,
  getInsights,
};
