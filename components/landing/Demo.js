import { Calendar, Clock, User, DollarSign, TrendingUp, Users } from "lucide-react";

export default function Demo() {
  const timeSlots = [
    { time: "09:00", status: "confirmado", client: "Ana S.", service: "Corte" },
    { time: "09:30", status: "confirmado", client: "Bruno C.", service: "Barba" },
    { time: "10:00", status: "confirmado", client: "Carla D.", service: "Depilação" },
    { time: "10:30", status: "disponivel", client: null, service: null },
    { time: "11:00", status: "atendendo", client: "Danielle R.", service: "Massagem" },
    { time: "11:30", status: "disponivel", client: null, service: null },
    { time: "14:00", status: "confirmado", client: "Eduardo M.", service: "Corte" },
    { time: "14:30", status: "cancelado", client: "Fernanda L.", service: "Pintura" },
    { time: "15:00", status: "disponivel", client: null, service: null },
    { time: "15:30", status: "confirmado", client: "Gabriel P.", service: "Barba + Cabelo" },
  ];

  const statusStyles = {
    confirmado: "bg-brand-100 border-brand-200 text-brand-700",
    disponivel: "bg-slate-50 border-slate-200 border-dashed text-slate-400",
    atendendo: "bg-emerald-100 border-emerald-200 text-emerald-700",
    cancelado: "bg-red-50 border-red-200 text-red-600 line-through",
  };

  const chartData = [
    { day: "Seg", value: 85 },
    { day: "Ter", value: 60 },
    { day: "Qua", value: 92 },
    { day: "Qui", value: 70 },
    { day: "Sex", value: 98 },
    { day: "Sáb", value: 100 },
    { day: "Dom", value: 40 },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="container-default">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold mb-4">
            Demonstração
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Veja como é simples
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Uma interface limpa, moderna e intuitiva para você e seus clientes.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-soft overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Agenda do Dia</h3>
                  <p className="text-sm text-slate-500">Segunda-feira • 15/09</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-brand-50 text-brand-700">
                  <span className="h-2 w-2 rounded-full bg-brand-500" /> Confirmado
                </span>
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Atendendo
                </span>
              </div>
            </div>

            <div className="p-5 max-h-[480px] overflow-y-auto">
              <div className="space-y-2">
                {timeSlots.map((slot, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-3.5 transition-all ${statusStyles[slot.status]}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 w-16 flex-shrink-0">
                        <Clock className="h-3.5 w-3.5 opacity-70" />
                        <span className="text-sm font-mono font-semibold">
                          {slot.time}
                        </span>
                      </div>
                      {slot.client ? (
                        <div className="flex-1 min-w-0 flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 opacity-70 flex-shrink-0" />
                              <p className="text-sm font-semibold truncate">
                                {slot.client}
                              </p>
                            </div>
                            <p className="text-xs opacity-80 ml-5 mt-0.5">
                              {slot.service}
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80 ml-2 flex-shrink-0">
                            {slot.status === "atendendo" && "• Ao vivo"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center py-1">
                          <span className="text-xs font-medium">Horário disponível</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+32%</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">R$ 12.450</p>
                <p className="text-sm text-slate-500 mt-1">Faturamento mês</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+18%</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">384</p>
                <p className="text-sm text-slate-500 mt-1">Agendamentos</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+52</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">1.248</p>
                <p className="text-sm text-slate-500 mt-1">Clientes ativos</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+8%</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">R$ 324</p>
                <p className="text-sm text-slate-500 mt-1">Ticket médio</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h4 className="font-bold text-slate-900">Ocupação semanal</h4>
                  <p className="text-sm text-slate-500">Setembro 2025</p>
                </div>
                <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
                  Média 77%
                </span>
              </div>
              <div className="flex items-end justify-between gap-2 h-32">
                {chartData.map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end h-24">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          item.value >= 90
                            ? "bg-gradient-to-t from-brand-600 to-brand-400"
                            : item.value >= 60
                            ? "bg-gradient-to-t from-indigo-500 to-indigo-300"
                            : "bg-gradient-to-t from-slate-400 to-slate-200"
                        }`}
                        style={{ height: `${item.value}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
