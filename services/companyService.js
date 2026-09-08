const MOCK_COMPANIES = {
  "studio-bella": {
    id: 1,
    slug: "studio-bella",
    name: "Studio Bella",
    businessType: "salao_beleza",
    logo: null,
    colorPrimary: "#ec4899",
    colorSecondary: "#f472b6",
    description: "Studio de beleza especializado em cabelo, unhas e estética.",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567",
    phone: "(11) 3456-7890",
    whatsapp: "(11) 99876-5432",
    email: "contato@studiobella.com.br",
    instagram: "@studiobella",
    facebook: "studiobella",
    workHours: {
      0: { enabled: false, openTime: "", closeTime: "", breakStart: "", breakEnd: "" },
      1: { enabled: true, openTime: "09:00", closeTime: "19:00", breakStart: "12:00", breakEnd: "13:00" },
      2: { enabled: true, openTime: "09:00", closeTime: "19:00", breakStart: "12:00", breakEnd: "13:00" },
      3: { enabled: true, openTime: "09:00", closeTime: "19:00", breakStart: "12:00", breakEnd: "13:00" },
      4: { enabled: true, openTime: "09:00", closeTime: "19:00", breakStart: "12:00", breakEnd: "13:00" },
      5: { enabled: true, openTime: "09:00", closeTime: "19:00", breakStart: "12:00", breakEnd: "13:00" },
      6: { enabled: true, openTime: "09:00", closeTime: "14:00", breakStart: "", breakEnd: "" },
    },
    services: [
      {
        id: 1,
        name: "Corte Feminino",
        description: "Corte personalizado com lavagem e finalização",
        category: "Cabelo",
        duration: 60,
        price: 100.0,
        color: "#ec4899",
      },
      {
        id: 2,
        name: "Escova Progressiva",
        description: "Alisamento com produto de alta qualidade",
        category: "Cabelo",
        duration: 120,
        price: 250.0,
        color: "#f472b6",
      },
      {
        id: 3,
        name: "Coloração",
        description: "Coloração completa com raiz e pontas",
        category: "Cabelo",
        duration: 90,
        price: 180.0,
        color: "#a855f7",
      },
      {
        id: 4,
        name: "Mechas",
        description: "Mechas tradicionais com luzes",
        category: "Cabelo",
        duration: 150,
        price: 220.0,
        color: "#f59e0b",
      },
      {
        id: 5,
        name: "Manicure",
        description: "Cuidado com as unhas das mãos",
        category: "Unhas",
        duration: 45,
        price: 45.0,
        color: "#10b981",
      },
      {
        id: 6,
        name: "Pedicure",
        description: "Cuidado com as unhas dos pés",
        category: "Unhas",
        duration: 60,
        price: 60.0,
        color: "#14b8a6",
      },
      {
        id: 7,
        name: "Unhas de Gel",
        description: "Aplicação de unhas de gel",
        category: "Unhas",
        duration: 90,
        price: 120.0,
        color: "#06b6d4",
      },
      {
        id: 8,
        name: "Limpeza de Pele",
        description: "Limpeza profunda com extração",
        category: "Estética",
        duration: 75,
        price: 150.0,
        color: "#3b82f6",
      },
      {
        id: 9,
        name: "Hidratação Facial",
        description: "Tratamento hidratante para pele",
        category: "Estética",
        duration: 60,
        price: 130.0,
        color: "#6366f1",
      },
    ],
    professionals: [
      {
        id: 1,
        name: "Ana Silva",
        role: "Cabeleireira Principal",
        avatar: null,
        color: "#ec4899",
        services: [1, 2, 3, 4],
      },
      {
        id: 2,
        name: "Maria Santos",
        role: "Manicure",
        avatar: null,
        color: "#10b981",
        services: [5, 6, 7],
      },
      {
        id: 3,
        name: "Juliana Costa",
        role: "Esteticista",
        avatar: null,
        color: "#3b82f6",
        services: [8, 9],
      },
      {
        id: 4,
        name: "Carolina Lima",
        role: "Cabeleireira",
        avatar: null,
        color: "#f59e0b",
        services: [1, 3, 4],
      },
    ],
  },
};

export async function getBySlug(slug) {
  console.log("[companyService] getBySlug", slug);

  const company = MOCK_COMPANIES[slug];
  if (!company) {
    return Promise.resolve(null);
  }
  return Promise.resolve({ ...company });
}

export async function list(params = {}) {
  console.log("[companyService] list", params);
  return Promise.resolve({
    data: Object.values(MOCK_COMPANIES),
    total: Object.keys(MOCK_COMPANIES).length,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
}

export async function get(id) {
  console.log("[companyService] get", id);
  const company = Object.values(MOCK_COMPANIES).find((c) => c.id === id);
  return Promise.resolve(company || null);
}

export async function create(data) {
  console.log("[companyService] create", data);
  return Promise.resolve({
    id: Date.now(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function update(id, data) {
  console.log("[companyService] update", { id, data });
  return Promise.resolve({
    id,
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function remove(id) {
  console.log("[companyService] remove", id);
  return Promise.resolve({ success: true, id });
}

export default {
  getBySlug,
  list,
  get,
  create,
  update,
  remove,
};
