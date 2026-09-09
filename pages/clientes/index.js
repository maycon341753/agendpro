import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { useToast } from "@/hooks/useToast";
import clientService from "@/services/clientService";
import { formatCurrencyBRL, formatDateBR } from "@/utils/format";
import {
  Plus,
  Search,
  Pencil,
  Eye,
  Users,
  ArrowUpDown,
} from "lucide-react";

const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  </div>
);

export default function ClientesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [orderBy, setOrderBy] = useState("created_at_desc");
  const [searchDebounced, setSearchDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await clientService.list({
        search: searchDebounced,
        status,
        page,
        limit: pageSize,
        orderBy,
      });
      setClients(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [searchDebounced, status, orderBy, page]);

  const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "active", label: "Ativo" },
    { value: "inactive", label: "Inativo" },
  ];

  const orderOptions = [
    { value: "created_at_desc", label: "Mais recentes" },
    { value: "created_at_asc", label: "Mais antigos" },
    { value: "name_asc", label: "Nome (A-Z)" },
    { value: "name_desc", label: "Nome (Z-A)" },
    { value: "total_spent_desc", label: "Maior gasto" },
    { value: "appointments_desc", label: "Mais atendimentos" },
  ];

  const getTicketMedio = (totalSpent, appointments) => {
    if (!appointments || appointments === 0) return 0;
    return Number(totalSpent) / appointments;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-7 w-7 text-brand-600" />
              Clientes
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gerencie o cadastro e histórico dos seus clientes
            </p>
          </div>
          <Link href="/clientes/novo" passHref legacyBehavior>
            <Button icon={<Plus className="h-4 w-4" />}>
              Novo Cliente
            </Button>
          </Link>
        </div>

        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
              <div className="md:col-span-5">
                <Input
                  placeholder="Buscar por nome, telefone ou e-mail..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              <div className="md:col-span-3">
                <Select
                  options={statusOptions}
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="md:col-span-4">
                <Select
                  options={orderOptions}
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value)}
                  leftIcon={<ArrowUpDown className="h-4 w-4" />}
                />
              </div>
            </div>

            {loading ? (
              <SkeletonTable rows={8} cols={8} />
            ) : clients.length === 0 ? (
              <EmptyState
                icon={<Users className="h-8 w-8 text-slate-400" strokeWidth={1.5} />}
                title="Sem clientes cadastrados"
                description="Cadastre seu primeiro cliente para começar a organizar o atendimento."
                action={{
                  label: "Novo Cliente",
                  onClick: () => router.push("/clientes/novo"),
                  icon: <Plus className="h-4 w-4" />,
                }}
              />
            ) : (
              <>
                <Table zebra colSpan={8}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead className="text-right">Último Atend.</TableHead>
                      <TableHead className="text-right">Total Gasto</TableHead>
                      <TableHead className="text-center">Atendimentos</TableHead>
                      <TableHead className="text-right">Ticket Médio</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              size="sm"
                              name={client.name}
                              src={client.avatar}
                            />
                            <div>
                              <div className="font-medium text-slate-900">
                                {client.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                #{client.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {client.phone || "-"}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {client.email || "-"}
                        </TableCell>
                        <TableCell className="text-right text-slate-700">
                          {client.lastVisit ? formatDateBR(client.lastVisit) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-900">
                          {formatCurrencyBRL(client.totalSpent)}
                        </TableCell>
                        <TableCell className="text-center text-slate-700">
                          <Badge variant="info">
                            {client.totalAppointments || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-slate-700">
                          {formatCurrencyBRL(
                            getTicketMedio(
                              client.totalSpent,
                              client.totalAppointments
                            )
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              client.status === "active"
                                ? "success"
                                : "muted"
                            }
                          >
                            {client.status === "active" ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/clientes/${client.id}`}
                              passHref
                              legacyBehavior
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Eye className="h-4 w-4" />}
                                aria-label="Ver detalhes"
                              />
                            </Link>
                            <Link
                              href={`/clientes/${client.id}?tab=info`}
                              passHref
                              legacyBehavior
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Pencil className="h-4 w-4" />}
                                aria-label="Editar"
                              />
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6">
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalCount={total}
                    onPageChange={setPage}
                  />
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  );
}
