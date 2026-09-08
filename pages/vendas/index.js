import React from "react";
import Head from "next/head";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import DateRangePicker from "@/components/ui/DateRangePicker";
import {
  ShoppingCart,
  Tag,
  DollarSign,
  Receipt,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import AdminLayout, { getLayout } from "@/layouts/AdminLayout";
import { formatCurrency, formatNumber } from "@/utils/format";
import { cn } from "@/utils/cn";

const MOCK_CHART = Array.from({ length: 14 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return {
    date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    value: Math.floor(Math.random() * 3000) + 800,
  };
});

export default function VendasPage() {
  const [range, setRange] = React.useState({ startDate: "", endDate: "" });

  const cards = [
    {
      title: "Faturamento Bruto",
      value: formatCurrency(18450.0),
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Descontos",
      value: formatCurrency(820.0),
      icon: Tag,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Faturamento Líquido",
      value: formatCurrency(17630.0),
      icon: TrendingUp,
      color: "bg-brand-50 text-brand-600",
    },
    {
      title: "Qtd. Vendas",
      value: formatNumber(94),
      icon: Receipt,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(187.55),
      icon: ShoppingCart,
      color: "bg-slate-50 text-slate-600",
    },
  ];

  return (
    <>
      <Head>
        <title>Vendas | AgendPro</title>
      </Head>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Vendas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Histórico e análise de vendas do seu negócio
          </p>
        </div>

        <DateRangePicker
          startDate={range.startDate}
          endDate={range.endDate}
          onChange={setRange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {cards.map((c) => (
            <Card key={c.title}>
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-slate-500">{c.title}</p>
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center",
                      c.color
                    )}
                  >
                    <c.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">
                  {c.value}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Evolução das Vendas</CardTitle>
            <CardDescription>Linha do tempo do período selecionado</CardDescription>
          </CardHeader>
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_CHART}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="date"
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
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ fill: "#2563eb", r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Vendas</CardTitle>
            <CardDescription>Todas as transações realizadas</CardDescription>
          </CardHeader>
          <CardBody className="!pt-0">
            <EmptyState
              title="Nenhuma venda registrada ainda."
              description="As vendas aparecerão aqui assim que forem lançadas no sistema."
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}

VendasPage.getLayout = getLayout;
