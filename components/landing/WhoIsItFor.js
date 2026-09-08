import {
  Stethoscope,
  Scissors,
  Smile,
  Sparkles,
  HeartPulse,
  UtensilsCrossed,
  Sandwich,
  Building2,
} from "lucide-react";

const categories = [
  {
    icon: Stethoscope,
    title: "Clínicas",
    desc: "Médicas, fisioterapia, psicologia e mais",
    color: "from-brand-500 to-brand-600",
    bg: "bg-brand-50",
  },
  {
    icon: Scissors,
    title: "Salões de Beleza",
    desc: "Cabelo, manicure, estética completa",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
  },
  {
    icon: Smile,
    title: "Barbearias",
    desc: "Corte, barba, atendimento premium",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
  },
  {
    icon: Sparkles,
    title: "Estética",
    desc: "Depilação, massagem, procedimentos",
    color: "from-purple-500 to-fuchsia-500",
    bg: "bg-purple-50",
  },
  {
    icon: HeartPulse,
    title: "Odontologia",
    desc: "Consultórios odontológicos organizados",
    color: "from-sky-500 to-cyan-500",
    bg: "bg-sky-50",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurantes",
    desc: "Reservas de mesas com horário marcado",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
  },
  {
    icon: Sandwich,
    title: "Hamburguerias",
    desc: "Pedidos antecipados e retirada programada",
    color: "from-red-500 to-orange-500",
    bg: "bg-red-50",
  },
  {
    icon: Building2,
    title: "Outros",
    desc: "Qualquer negócio com atendimento agendado",
    color: "from-slate-600 to-slate-700",
    bg: "bg-slate-100",
  },
];

export default function WhoIsItFor() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container-default">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm font-semibold mb-4">
            Para Quem É
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Perfeito para diversos segmentos
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            O AgendPro se adapta a qualquer tipo de negócio que trabalhe com
            horários e agendamentos.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((c, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 text-center hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 transition-all duration-300"
            >
              <div
                className={`mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${c.color} shadow-md mb-4 group-hover:scale-110 transition-transform`}
              >
                <c.icon className="h-8 w-8 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {c.title}
              </h3>
              <p className="text-sm text-slate-500">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
