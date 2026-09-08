import Link from "next/link";
import { Sparkles, Rocket } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-brand-900 to-indigo-900" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container-default relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-brand-100 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Comece hoje mesmo
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            Pronto para organizar{" "}
            <span className="bg-gradient-to-r from-brand-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
              seu negócio
            </span>
            ?
          </h2>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Junte-se a centenas de negócios que já economizam tempo e aumentam
            o faturamento com o AgendPro.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/cadastro"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-500 text-white font-bold text-lg shadow-2xl shadow-brand-900/50 hover:shadow-brand-900/60 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Rocket className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              Começar grátis agora
            </Link>
          </div>

          <p className="text-sm sm:text-base text-slate-400 flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sem cartão
            </span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1">
              <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Configuração em 2 minutos
            </span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1">
              <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Cancele quando quiser
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
