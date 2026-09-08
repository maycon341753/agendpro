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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  Wallet,
  CheckCircle2,
  Clock,
  Tag,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import AdminLayout, { getLayout } from "@/layouts/AdminLayout";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";

export default function FinanceiroPage() {
  const [range, setRange] = React.useState({ startDate: "", endDate: "" });

  const cards = [
    {
      title: "Faturamento Período",
      value: formatCurrency(28500.0),
      icon: Wallet,
      color: "bg-brand-50 text-brand-600",
    },
    {
      title: "Recebimentos",
      value: formatCurrency(24300.0),
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Pendentes",
      value: formatCurrency(3800.0),
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Descontos",
      value: formatCurrency(820.0),
      icon: Tag,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Cancelamentos",
      value: formatCurrency(420.0),
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(182.75),
      icon: TrendingUp,
      color: "bg-slate-50 text-slate-600",
    },
  ];

  return (
    <>
      <Head>
        <title>Financeiro | AgendPro</title>
      </Head>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Financeiro
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Controle de recebíveis, pagamentos e métricas financeiras
          </p>
        </div>

        <DateRangePicker
          startDate={range.startDate}
          endDate={range.endDate}
          onChange={setRange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <CardTitle>Análises Financeiras</CardTitle>
            <CardDescription>
              Visualize o financeiro por diferentes perspectivas
            </CardDescription>
          </CardHeader>
          <CardBody className="!pt-0">
            <Tabs defaultValue="dia">
              <TabsList>
                <TabsTrigger value="dia">Por Dia</TabsTrigger>
                <TabsTrigger value="servico">Por Serviço</TabsTrigger>
                <TabsTrigger value="profissional">Por Profissional</TabsTrigger>
                <TabsTrigger value="pagamento">Forma Pagamento</TabsTrigger>
              </TabsList>

              {["dia", "servico", "profissional", "pagamento"].map((tab) => (
                <TabsContent key={tab} value={tab}>
                  <EmptyState
                    title="Nenhum dado financeiro ainda."
                    description="Os lançamentos aparecerão aqui conforme forem sendo registrados."
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

FinanceiroPage.getLayout = getLayout;
