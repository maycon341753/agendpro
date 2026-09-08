import Link from "next/link";
import { Play, Calendar, BarChart3, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white py-16 sm:py-20 lg:py-28">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
      </div>

      <div className="container-default relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Agenda inteligente • CRM • Financeiro
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Seu negócio organizado.{" "}
              <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
                Seus clientes agendados.
              </span>{" "}
              Seu atendimento mais profissional.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Tudo o que você precisa para gerenciar agendamentos, clientes,
              comissões e financeiro em uma única plataforma simples e poderosa.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Link
                href="/cadastro"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold text-base shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 hover:-translate-y-0.5 transition-all"
              >
                Começar grátis
              </Link>
              <Link
                href="/agendar/studio-bella"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-base shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <Play className="h-5 w-5 text-brand-600 fill-brand-600" />
                Testar plataforma
              </Link>
            </div>

            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[
                  "from-pink-400 to-rose-500",
                  "from-amber-400 to-orange-500",
                  "from-emerald-400 to-teal-500",
                  "from-brand-400 to-indigo-500",
                ].map((grad, i) => (
                  <div
                    key={i}
                    className={`h-9 w-9 rounded-full bg-gradient-to-br ${grad} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-600">
                Já <strong className="text-slate-900">+500 negócios</strong> usando AgendPro
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-4 bg-gradient-to-br from-brand-400/20 via-indigo-400/20 to-purple-400/20 rounded-3xl blur-2xl" />

              <div className="relative rounded-3xl bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-600 p-1 shadow-2xl">
                <div className="rounded-[22px] bg-slate-50 p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs font-medium text-slate-500">Hoje</p>
                      <p className="text-xl font-bold text-slate-900">Segunda, 15 Set</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <BarChart3 className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="rounded-xl bg-white border border-slate-200 p-3 text-center shadow-sm">
                      <p className="text-2xl font-bold text-brand-600">24</p>
                      <p className="text-xs text-slate-500 mt-1">Agendamentos</p>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-200 p-3 text-center shadow-sm">
                      <p className="text-2xl font-bold text-emerald-600">92%</p>
                      <p className="text-xs text-slate-500 mt-1">Ocupação</p>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-200 p-3 text-center shadow-sm">
                      <p className="text-2xl font-bold text-indigo-600">R$4.2k</p>
                      <p className="text-xs text-slate-500 mt-1">Faturamento</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { time: "09:00", name: "Ana Silva", service: "Corte Feminino", color: "bg-brand-500" },
                      { time: "10:00", name: "Bruno Costa", service: "Barba + Cabelo", color: "bg-emerald-500" },
                      { time: "11:00", name: "Carla Dias", service: "Depilação", color: "bg-pink-500" },
                      { time: "14:00", name: "Daniela Rocha", service: "Massagem", color: "bg-amber-500" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 p-3 shadow-sm"
                      >
                        <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                        <p className="text-sm font-mono font-semibold text-slate-700 w-12">
                          {item.time}
                        </p>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                          <p className="text-xs text-slate-500 truncate">{item.service}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/60 p-5">
                    <div className="flex items-end justify-between h-24 gap-2">
                      {[65, 40, 80, 55, 90, 70, 85].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-indigo-400"
                            style={{ height: `${h}%` }}
                          />
                          <span className="text-[10px] text-slate-500">
                            {["S", "T", "Q", "Q", "S", "S", "D"][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
