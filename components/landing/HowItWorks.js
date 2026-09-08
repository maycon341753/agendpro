import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Cadastre sua empresa",
    desc: "Crie sua conta grátis e configure os dados da sua empresa em menos de 2 minutos.",
    color: "from-brand-500 to-brand-600",
  },
  {
    number: "2",
    title: "Organize tudo",
    desc: "Cadastre serviços, profissionais, horários de atendimento e suas preferências.",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    number: "3",
    title: "Compartilhe e receba",
    desc: "Compartilhe seu link de agendamento e comece a receber agendamentos automaticamente.",
    color: "from-emerald-500 to-emerald-600",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container-default">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold mb-4">
            Como Funciona
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Comece em 3 passos simples
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Sem complicação, sem taxas escondidas. Você configura e começa a usar hoje mesmo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-10 relative">
          <div className="hidden md:block absolute top-20 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-brand-200 via-indigo-200 to-emerald-200" />

          {steps.map((s, i) => (
            <div key={i} className="relative">
              <div className="relative z-10 bg-white rounded-2xl border border-slate-200 p-7 lg:p-8 shadow-sm hover:shadow-lg transition-all">
                <div
                  className={`inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br ${s.color} text-white text-4xl font-bold shadow-lg mb-6`}
                >
                  {s.number}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {s.title}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">{s.desc}</p>
                <ul className="space-y-2">
                  {["Rápido e simples", "Sem burocracia", "100% online"].map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
