import {
  CalendarDays,
  Users,
  Wallet,
  Percent,
  Clock,
  Headphones,
} from "lucide-react";

const benefits = [
  {
    icon: CalendarDays,
    title: "Agenda Profissional",
    desc: "Organize horários, serviços e profissionais com uma agenda intuitiva e visual.",
    color: "from-brand-500 to-brand-600",
    bg: "bg-brand-50",
    text: "text-brand-600",
  },
  {
    icon: Users,
    title: "Clientes Sem Fila",
    desc: "Seus clientes agendam online a qualquer hora, sem precisar ligar ou esperar.",
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    icon: Wallet,
    title: "Financeiro Completo",
    desc: "Controle receitas, despesas, recebimentos e visualize seu faturamento em tempo real.",
    color: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
  },
  {
    icon: Percent,
    title: "Comissões Automáticas",
    desc: "Calcule comissões de profissionais automaticamente e gere relatórios detalhados.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    icon: Clock,
    title: "Agendamento 24h",
    desc: "Sua página de agendamento disponível 24 horas por dia, 7 dias por semana.",
    color: "from-purple-500 to-purple-600",
    bg: "bg-purple-50",
    text: "text-purple-600",
  },
  {
    icon: Headphones,
    title: "Suporte Dedicado",
    desc: "Equipe de suporte em português pronta para ajudar você por chat, e-mail e WhatsApp.",
    color: "from-rose-500 to-pink-500",
    bg: "bg-rose-50",
    text: "text-rose-600",
  },
];

export default function Benefits() {
  return (
    <section id="beneficios" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="container-default">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-semibold mb-4">
            Benefícios
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Economize horas por semana com ferramentas projetadas para simplificar
            a gestão do seu negócio.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 transition-all duration-300"
            >
              <div
                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${b.bg} ${b.text} mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <b.icon className="h-7 w-7" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {b.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
