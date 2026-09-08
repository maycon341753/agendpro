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
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  BarChart3,
  Users,
  Scissors,
  Calendar,
  ShoppingCart,
  Wallet,
  Percent,
  Download,
  FileSpreadsheet,
  Sparkles,
  Gauge,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import AdminLayout, { getLayout } from "@/layouts/AdminLayout";
import { cn } from "@/utils/cn";

const REPORTS = [
  {
    id: "vendas",
    title: "Relatório de Vendas",
    description: "Todas as vendas e transações",
    icon: ShoppingCart,
    color: "bg-brand-50 text-brand-600 border-brand-200",
  },
  {
    id: "clientes",
    title: "Relatório de Clientes",
    description: "Base de clientes e fidelidade",
    icon: Users,
    color: "bg-green-50 text-green-600 border-green-200",
  },
  {
    id: "servicos",
    title: "Relatório de Serviços",
    description: "Serviços mais e menos vendidos",
    icon: Scissors,
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    id: "agendamentos",
    title: "Relatório de Agendamentos",
    description: "Taxas de ocupação e cancelamento",
    icon: Calendar,
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    id: "financeiro",
    title: "Relatório Financeiro",
    description: "Receitas, custos e lucratividade",
    icon: Wallet,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    id: "comissoes",
    title: "Relatório de Comissões",
    description: "Comissões por profissional",
    icon: Percent,
    color: "bg-pink-50 text-pink-600 border-pink-200",
  },
  {
    id: "profissionais",
    title: "Desempenho de Equipe",
    description: "Produtividade individual",
    icon: Gauge,
    color: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
  {
    id: "fidelidade",
    title: "Fidelidade & Retenção",
    description: "Análise de recorrência de clientes",
    icon: Sparkles,
    color: "bg-rose-50 text-rose-600 border-rose-200",
  },
  {
    id: "personalizado",
    title: "Relatório Personalizado",
    description: "Monte seu próprio relatório",
    icon: FileSpreadsheet,
    color: "bg-slate-50 text-slate-600 border-slate-200",
  },
];

export default function RelatoriosPage() {
  const [range, setRange] = React.useState({ startDate: "", endDate: "" });
  const [selected, setSelected] = React.useState("vendas");
  const { toast } = useToast();

  return (
    <>
      <Head>
        <title>Relatórios | AgendPro</title>
      </Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Relatórios
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Análises detalhadas para tomar decisões mais inteligentes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              icon={<Download className="h-4 w-4" />}
              disabled
              onClick={() => toast({ title: "Exportando...", variant: "info" })}
            >
              Exportar CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-brand-600" />
                Selecione o relatório
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {REPORTS.map((r) => {
                  const active = selected === r.id;
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelected(r.id)}
                      className={cn(
                        "text-left rounded-xl border-2 p-4 transition-all duration-200 group",
                        active
                          ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-200 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border",
                            r.color
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-slate-900">
                              {r.title}
                            </p>
                            {active && (
                              <Badge variant="info" className="text-[10px]">
                                Selecionado
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {r.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <DateRangePicker
              startDate={range.startDate}
              endDate={range.endDate}
              onChange={setRange}
            />
            <Card className="bg-gradient-to-br from-brand-50 to-white border-brand-100">
              <CardBody>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white border border-brand-200 flex items-center justify-center shrink-0">
                    <BarChart3 className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">
                      Relatório selecionado
                    </p>
                    <p className="text-sm text-brand-700 font-medium mt-0.5">
                      {REPORTS.find((r) => r.id === selected)?.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Período:{" "}
                      <span className="font-medium text-slate-700">
                        {range.startDate && range.endDate
                          ? `${range.startDate} a ${range.endDate}`
                          : "Personalizar acima"}
                      </span>
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Dados do relatório:{" "}
              <span className="text-brand-600">
                {REPORTS.find((r) => r.id === selected)?.title}
              </span>
            </CardTitle>
            <CardDescription>
              Visualização tabular pronta para exportação
            </CardDescription>
          </CardHeader>
          <CardBody className="!pt-0">
            <EmptyState
              icon={FileSpreadsheet}
              title="Nenhum dado para exibir ainda."
              description="Selecione um período e o relatório desejado para carregar as informações."
              action={{
                label: "Gerar relatório de exemplo",
                variant: "outline",
                icon: <BarChart3 className="h-4 w-4" />,
                onClick: () =>
                  toast({
                    title: "Relatório",
                    description: "Gerador em desenvolvimento.",
                    variant: "info",
                  }),
              }}
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}

RelatoriosPage.getLayout = getLayout;
