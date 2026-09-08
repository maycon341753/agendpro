import {
  Building2,
  MessageCircle,
  Percent,
  FileSpreadsheet,
  LayoutDashboard,
  TrendingUp,
  UserSearch,
  CalendarOff,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Multi-empresa",
    desc: "Gerencie múltiplas empresas ou filiais em uma única conta com controle total.",
  },
  {
    icon: MessageCircle,
    title: "Notificações WhatsApp",
    desc: "Envie lembretes automáticos e confirmações de agendamento via WhatsApp.",
  },
  {
    icon: Percent,
    title: "Gestão de Comissões",
    desc: "Defina percentuais por profissional e serviço, com cálculos automáticos.",
  },
  {
    icon: FileSpreadsheet,
    title: "Relatórios CSV",
    desc: "Exporte relatórios completos de agendamentos, financeiro e clientes em CSV.",
  },
  {
    icon: LayoutDashboard,
    title: "Taxa de Ocupação",
    desc: "Acompanhe a taxa de ocupação da sua agenda e identifique horários vazios.",
  },
  {
    icon: TrendingUp,
    title: "Ticket Médio",
    desc: "Métricas de ticket médio por cliente, profissional e período analisado.",
  },
  {
    icon: UserSearch,
    title: "CRM Detalhado",
    desc: "Histórico completo de clientes, preferências, anotações e próximos retornos.",
  },
  {
    icon: CalendarOff,
    title: "Bloqueios/Feriados",
    desc: "Bloqueie horários, dias específicos, férias e feriados com facilidade.",
  },
];

const iconColors = [
  "bg-brand-50 text-brand-600",
  "bg-emerald-50 text-emerald-600",
  "bg-indigo-50 text-indigo-600",
  "bg-amber-50 text-amber-600",
  "bg-purple-50 text-purple-600",
  "bg-rose-50 text-rose-600",
  "bg-teal-50 text-teal-600",
  "bg-sky-50 text-sky-600",
];

export default function Features() {
  return (
    <section id="recursos" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="container-default">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-4">
            Recursos
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Ferramentas poderosas para o seu negócio
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Recursos completos que vão desde o agendamento até a análise detalhada
            do desempenho da sua empresa.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300"
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${iconColors[i]} mb-4 group-hover:scale-110 transition-transform`}
              >
                <f.icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
