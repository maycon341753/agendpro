import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import Skeleton, { SkeletonText } from "@/components/ui/Skeleton";
import Alert from "@/components/ui/Alert";
import DateRangePicker from "@/components/ui/DateRangePicker";
import Avatar from "@/components/ui/Avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CalendarDays,
  Scissors,
  UserPlus,
  Users,
  Receipt,
  XCircle,
  Gauge,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import AdminLayout, { getLayout } from "@/layouts/AdminLayout";
import dashboardService from "@/services/dashboardService";
import { APPOINTMENT_STATUS } from "@/utils/constants";
import { formatCurrency, formatNumber } from "@/utils/format";
import { cn } from "@/utils/cn";

const CHART_COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#6b7280",
];

function KPICard({
  title,
  value,
  delta,
  icon: Icon,
  color = "brand",
  extra,
  loading,
}) {
  const positive = delta !== undefined && delta >= 0;
  const colorMap = {
    brand: "bg-brand-50 text-brand-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    slate: "bg-slate-50 text-slate-600",
  };

  return (
    <Card>
      <CardBody>
        {loading ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
              </div>
              <div
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                  colorMap[color]
                )}
              >
                {Icon && <Icon className="h-5 w-5" />}
              </div>
            </div>
            <div className="mb-2">
              <p className="text-2xl font-bold text-slate-900 tracking-tight">
                {value}
              </p>
            </div>
            {delta !== undefined && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                  positive
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                )}
              >
                {positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(delta)}% vs período anterior
              </div>
            )}
            {extra && <div className="mt-3">{extra}</div>}
          </>
        )}
      </CardBody>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, company } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState({ startDate: "", endDate: "" });
  const [kpis, setKpis] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [topProfessionals, setTopProfessionals] = useState([]);
  const [customers, setCustomers] = useState(null);
  const [insights, setInsights] = useState([]);

  const today = new Date().toISOString().split("T")[0];
  const presetStart = new Date();
  presetStart.setDate(presetStart.getDate() - 29);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const start = range.startDate || presetStart.toISOString().split("T")[0];
        const end = range.endDate || today;
        const [
          k,
          rev,
          st,
          svc,
          prof,
          cust,
          ins,
        ] = await Promise.all([
          dashboardService.getKPIs(company?.id, { startDate: start, endDate: end }),
          dashboardService.getRevenueChartData(company?.id, "day"),
          dashboardService.getAppointmentsByStatus(company?.id, { startDate: start, endDate: end }),
          dashboardService.getTopServices(company?.id, { startDate: start, endDate: end }),
          dashboardService.getTopProfessionals(company?.id, { startDate: start, endDate: end }),
          dashboardService.getCustomersBreakdown(company?.id, { startDate: start, endDate: end }),
          dashboardService.getInsights(company?.id),
        ]);
        setKpis(k);
        setRevenueData(
          rev.map((d) => ({
            ...d,
            dateLabel: new Date(d.date).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            }),
          }))
        );
        const statusArr = Object.entries(st).map(([key, value]) => ({
          key,
          value,
          label: APPOINTMENT_STATUS[key]?.label || key,
          color: APPOINTMENT_STATUS[key]?.color || CHART_COLORS[0],
        }));
        setStatusData(statusArr);
        const totalSvcRev = svc.reduce((s, i) => s + (i.revenue || 0), 0);
        setTopServices(
          svc.map((s) => ({
            ...s,
            pct: totalSvcRev > 0 ? (s.revenue / totalSvcRev) * 100 : 0,
          }))
        );
        const totalProfRev = prof.reduce((s, i) => s + (i.revenue || 0), 0);
        setTopProfessionals(
          prof.map((p, idx) => ({
            ...p,
            ticket: p.count > 0 ? p.revenue / p.count : 0,
            occupancy: 50 + idx * 10,
          }))
        );
        setCustomers(cust);
        setInsights(ins);
      } catch (err) {
        console.error(err);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do dashboard.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [range, company?.id]);

  const handleExport = () => {
    toast({
      title: "Relatório",
      description: "Exportação em desenvolvimento.",
      variant: "info",
    });
  };

  const kpiList = kpis
    ? [
        {
          title: "Faturamento Hoje",
          value: formatCurrency(kpis.revenueToday),
          delta: 12.4,
          icon: DollarSign,
          color: "green",
        },
        {
          title: "Faturamento Mês",
          value: formatCurrency(kpis.revenueMonth),
          delta: 8.2,
          icon: Receipt,
          color: "brand",
        },
        {
          title: "Agendamentos Hoje",
          value: formatNumber(kpis.appointmentsToday),
          delta: -3.1,
          icon: Calendar,
          color: "purple",
        },
        {
          title: "Agendamentos Mês",
          value: formatNumber(kpis.appointmentsMonth),
          delta: 15.7,
          icon: CalendarDays,
          color: "amber",
        },
        {
          title: "Serviços Realizados",
          value: formatNumber(kpis.servicesDone),
          delta: 6.3,
          icon: Scissors,
          color: "slate",
        },
        {
          title: "Clientes Novos",
          value: formatNumber(kpis.newCustomers),
          delta: 21.0,
          icon: UserPlus,
          color: "green",
        },
        {
          title: "Clientes Ativos",
          value: formatNumber(kpis.activeCustomers),
          delta: 4.1,
          icon: Users,
          color: "brand",
        },
        {
          title: "Ticket Médio",
          value: formatCurrency(kpis.avgTicket),
          delta: 2.8,
          icon: TrendingUp,
          color: "purple",
        },
        {
          title: "Taxa Cancelamento",
          value: `${kpis.cancellationRate.toFixed(1)}%`,
          delta: -1.2,
          icon: XCircle,
          color: "red",
        },
        {
          title: "Taxa Ocupação",
          value: `${kpis.occupancyRate.toFixed(1)}%`,
          delta: 5.4,
          icon: Gauge,
          color: "amber",
          extra: (
            <ProgressBar value={kpis.occupancyRate} color="amber" size="sm" />
          ),
        },
      ]
    : Array.from({ length: 10 });

  return (
    <>
      <Head>
        <title>Dashboard | AgendPro</title>
      </Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Visão geral do seu negócio em tempo real
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon={<Download className="h-4 w-4" />}
              onClick={handleExport}
            >
              Exportar
            </Button>
          </div>
        </div>

        <DateRangePicker
          startDate={range.startDate}
          endDate={range.endDate}
          onChange={setRange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {kpiList.map((k, idx) =>
            loading || !kpis ? (
              <KPICard key={`skel-${idx}`} loading />
            ) : (
              <KPICard key={k.title} {...k} />
            )
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Faturamento</CardTitle>
                  <CardDescription>Últimos 14 dias</CardDescription>
                </div>
                <Badge variant="info">Gráfico</Badge>
              </div>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="h-72 flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="dateLabel"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) =>
                          v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                        }
                      />
                      <Tooltip
                        formatter={(v) => formatCurrency(v)}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                          fontSize: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Agendamentos por Status</CardTitle>
                  <CardDescription>Distribuição no período</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="h-72 flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={36}>
                        {statusData.map((entry, i) => (
                          <Cell key={`c-${i}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Serviços Mais Vendidos</CardTitle>
              <CardDescription>Ranking por faturamento</CardDescription>
            </CardHeader>
            <CardBody className="!pt-0">
              {loading ? (
                <div className="space-y-3 py-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serviço</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Faturamento</TableHead>
                      <TableHead className="text-right w-32">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topServices.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <span className="font-medium text-slate-900">{s.name}</span>
                        </TableCell>
                        <TableCell className="text-right">{s.count}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(s.revenue)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <ProgressBar value={s.pct} color="brand" size="sm" />
                            <p className="text-xs text-slate-500 text-right">
                              {s.pct.toFixed(1)}%
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ranking de Profissionais</CardTitle>
              <CardDescription>Por número de atendimentos</CardDescription>
            </CardHeader>
            <CardBody className="!pt-0">
              {loading ? (
                <div className="space-y-3 py-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-right">Atend.</TableHead>
                      <TableHead className="text-right">Faturamento</TableHead>
                      <TableHead className="text-right">Ticket</TableHead>
                      <TableHead className="text-right w-28">Ocupação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProfessionals.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar size="sm" name={p.name} src={p.avatar} />
                            <span className="font-medium text-slate-900">
                              {p.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{p.count}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(p.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(p.ticket)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <ProgressBar
                              value={p.occupancy}
                              color={p.occupancy >= 80 ? "success" : p.occupancy >= 50 ? "brand" : "warning"}
                              size="sm"
                            />
                            <p className="text-xs text-slate-500 text-right">
                              {p.occupancy.toFixed(0)}%
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Clientes Novos",
              value: customers?.newCustomers,
              icon: UserPlus,
              color: "bg-green-50 text-green-600 border-green-200",
              badge: "Período",
              loading,
            },
            {
              title: "Clientes Recorrentes",
              value: customers?.recurring,
              icon: Users,
              color: "bg-brand-50 text-brand-600 border-brand-200",
              badge: "Retorno",
              loading,
            },
            {
              title: "Clientes Inativos",
              value: customers?.inactive,
              icon: XCircle,
              color: "bg-slate-50 text-slate-600 border-slate-200",
              badge: "+30 dias",
              loading,
            },
          ].map((c) => (
            <Card key={c.title} className={cn("border-2", c.color.split(" ")[2])}>
              <CardBody>
                {c.loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border",
                        c.color
                      )}
                    >
                      <c.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-slate-500">
                          {c.title}
                        </p>
                        <Badge variant="muted" className="text-[10px]">
                          {c.badge}
                        </Badge>
                      </div>
                      <p className="text-3xl font-bold text-slate-900 tracking-tight">
                        {formatNumber(c.value || 0)}
                      </p>
                      {customers?.total && (
                        <p className="text-xs text-slate-500 mt-1">
                          {((c.value / customers.total) * 100).toFixed(1)}% de{" "}
                          {formatNumber(customers.total)} clientes
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-slate-900">Insights</h2>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-slate-200 p-4">
                  <SkeletonText lines={2} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {insights.slice(0, 6).map((text, i) => (
                <Alert key={i} variant="info" title={`Dica #${i + 1}`}>
                  {text}
                </Alert>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

DashboardPage.getLayout = getLayout;
