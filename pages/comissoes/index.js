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
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  Percent,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import AdminLayout, { getLayout } from "@/layouts/AdminLayout";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";

export default function ComissoesPage() {
  const [range, setRange] = React.useState({ startDate: "", endDate: "" });

  const cards = [
    {
      title: "Comissão Gerada",
      value: formatCurrency(5720.0),
      icon: Sparkles,
      color: "bg-brand-50 text-brand-600",
      delta: "+12,3%",
      positive: true,
    },
    {
      title: "Comissão Paga",
      value: formatCurrency(3980.0),
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
      delta: "+8,1%",
      positive: true,
    },
    {
      title: "Comissão Pendente",
      value: formatCurrency(1740.0),
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      delta: "-2,4%",
      positive: false,
    },
  ];

  return (
    <>
      <Head>
        <title>Comissões | AgendPro</title>
      </Head>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Comissões
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão e acompanhamento de comissões de profissionais
          </p>
        </div>

        <DateRangePicker
          startDate={range.startDate}
          endDate={range.endDate}
          onChange={setRange}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">
                    {c.value}
                  </p>
                  <Badge variant={c.positive ? "success" : "danger"}>
                    {c.delta}
                  </Badge>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comissões por Profissional</CardTitle>
            <CardDescription>
              Detalhamento individual por colaborador
            </CardDescription>
          </CardHeader>
          <CardBody className="!pt-0">
            <Table hasData={false} colSpan={6}>
              <TableHeader>
                <TableRow>
                  <TableHead>Profissional</TableHead>
                  <TableHead className="text-right">Atendimentos</TableHead>
                  <TableHead className="text-right">Vendas</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead className="text-right">Gerada</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody />
            </Table>
            <EmptyState
              icon={<Percent className="h-8 w-8 text-slate-400" strokeWidth={1.5} />}
              title="Nenhuma comissão calculada ainda."
              description="As comissões serão exibidas aqui conforme os atendimentos forem concluídos."
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}

ComissoesPage.getLayout = getLayout;
