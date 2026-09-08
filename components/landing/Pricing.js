import Link from "next/link";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Gratuito",
    description: "Para começar a testar a plataforma",
    price: "0",
    period: "/mês",
    highlight: false,
    cta: "Começar grátis",
    ctaHref: "/cadastro",
    features: [
      "Até 30 agendamentos/mês",
      "1 profissional",
      "Agenda básica",
      "Página de agendamento pública",
      "Suporte por e-mail",
    ],
  },
  {
    name: "Básico",
    description: "Para pequenos negócios iniciando",
    price: "79",
    period: "/mês",
    highlight: false,
    cta: "Começar",
    ctaHref: "/cadastro",
    features: [
      "Até 200 agendamentos/mês",
      "3 profissionais",
      "Agenda completa",
      "CRM de clientes",
      "Financeiro básico",
      "Suporte por chat",
      "Lembretes por SMS",
    ],
  },
  {
    name: "Profissional",
    description: "Para negócios em crescimento",
    price: "149",
    period: "/mês",
    highlight: true,
    badge: "MAIS POPULAR",
    cta: "Começar",
    ctaHref: "/cadastro",
    features: [
      "Agendamentos ilimitados",
      "10 profissionais",
      "Multi-empresa (3 unidades)",
      "Comissões automáticas",
      "Financeiro completo",
      "Relatórios CSV",
      "Integração WhatsApp",
      "Suporte prioritário",
    ],
  },
  {
    name: "Enterprise",
    description: "Soluções personalizadas para grandes operações",
    price: "Sob consulta",
    period: "",
    highlight: false,
    cta: "Falar com vendas",
    ctaHref: "/contato",
    features: [
      "Tudo do Profissional",
      "Profissionais ilimitados",
      "Multi-empresa ilimitado",
      "API de integração",
      "SLA de uptime garantido",
      "Gerente de conta dedicado",
      "Onboarding personalizado",
      "Suporte telefônico VIP",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="planos" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="container-default">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-rose-50 text-rose-700 text-sm font-semibold mb-4">
            Planos
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Preços que cabem no seu bolso
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Comece grátis, escale conforme seu negócio cresce. Sem taxas escondidas.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-6 lg:p-7 flex flex-col transition-all duration-300 ${
                plan.highlight
                  ? "bg-gradient-to-b from-brand-600 to-indigo-700 text-white shadow-2xl shadow-brand-600/30 border border-brand-500 scale-[1.02] lg:scale-105 z-10"
                  : "bg-white border border-slate-200 shadow-sm hover:shadow-lg"
              }`}
            >
              {plan.highlight && plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-amber-400 text-amber-950 text-xs font-bold shadow-lg">
                    <Zap className="h-3.5 w-3.5" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h3
                  className={`text-xl font-bold mb-1 ${
                    plan.highlight ? "text-white" : "text-slate-900"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm ${
                    plan.highlight ? "text-white/80" : "text-slate-500"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  {plan.price !== "Sob consulta" && (
                    <span
                      className={`text-sm font-semibold ${
                        plan.highlight ? "text-white/80" : "text-slate-500"
                      }`}
                    >
                      R$
                    </span>
                  )}
                  <span
                    className={`text-4xl lg:text-5xl font-extrabold tracking-tight ${
                      plan.highlight ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-base font-medium ${
                      plan.highlight ? "text-white/80" : "text-slate-500"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="flex-1 space-y-3 mb-7">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <Check
                      className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        plan.highlight
                          ? "text-emerald-300"
                          : "text-emerald-500"
                      }`}
                      strokeWidth={2.5}
                    />
                    <span
                      className={`text-sm leading-relaxed ${
                        plan.highlight ? "text-white/90" : "text-slate-600"
                      }`}
                    >
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                  plan.highlight
                    ? "bg-white text-brand-700 hover:bg-slate-100 shadow-lg"
                    : "bg-gradient-to-r from-brand-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-brand-600/25"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
