import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Preciso de cartão de crédito para começar?",
    a: "Não! Você pode começar no plano Gratuito sem precisar cadastrar cartão de crédito nenhum. Ao atingir o limite de agendamentos do plano gratuito, você pode optar por contratar um plano pago, mas sem compromisso.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Claro! Não há fidelidade nem multa por cancelamento. Você pode cancelar seu plano pago a qualquer momento diretamente na sua área administrativa. O acesso permanece válido até o fim do período pago.",
  },
  {
    q: "Funciona no celular e no computador?",
    a: "Sim! O AgendPro é 100% web e responsivo, funcionando perfeitamente em celulares, tablets e computadores, em qualquer navegador moderno. Não precisa instalar nada.",
  },
  {
    q: "Como funciona o agendamento público?",
    a: "Cada empresa recebe uma página de agendamento pública com um link exclusivo (ex: agendpro.com.br/sua-empresa). Você compartilha esse link com seus clientes e eles podem agendar serviços, escolher profissional e horário disponível 24h por dia.",
  },
  {
    q: "O suporte é em português?",
    a: "Sim! Todo o nosso suporte é feito por brasileiros, em português. Você pode contar com atendimento por chat, e-mail e WhatsApp (nos planos pagos) para tirar todas as suas dúvidas.",
  },
  {
    q: "Integra com WhatsApp?",
    a: "Sim! Nos planos Básico e Profissional temos integração com WhatsApp para envio de lembretes automáticos de agendamento, confirmações e notificações de cancelamento, reduzindo drasticamente as faltas.",
  },
  {
    q: "Permite múltiplos usuários?",
    a: "Sim! Você pode adicionar profissionais, atendentes e administradores, cada um com nível de acesso apropriado. O plano Gratuito permite 1 profissional, Básico 3 e Profissional 10. No Enterprise é ilimitado.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Absolutamente! Usamos criptografia de ponta a ponta, servidores na nuvem com backups diários e seguimos todas as diretrizes da LGPD. Seus dados e os dos seus clientes estão protegidos com os mais altos padrões de segurança do mercado.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="container-default max-w-4xl">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-sm font-semibold mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Respostas para as dúvidas mais comuns sobre o AgendPro.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-brand-200 bg-brand-50/40 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left"
                >
                  <span className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed pr-2">
                    {faq.q}
                  </span>
                  <div
                    className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                      isOpen
                        ? "bg-brand-600 text-white rotate-180"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <ChevronDown className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-2">
                      <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
