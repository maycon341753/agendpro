import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Users,
  Scissors,
  UserCheck,
  ShoppingCart,
  Wallet,
  Percent,
  BarChart3,
  Bell,
  Settings,
  Shield,
  Menu,
  X,
  Search,
  ChevronDown,
  LogOut,
  User,
  Building2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/utils/cn";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/Dropdown";

const MENU_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Agenda",
    href: "/agenda",
    icon: Calendar,
  },
  {
    label: "Agendamentos",
    href: "/agendamentos",
    icon: CalendarDays,
  },
  {
    label: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    label: "Serviços",
    href: "/servicos",
    icon: Scissors,
  },
  {
    label: "Profissionais",
    href: "/profissionais",
    icon: UserCheck,
  },
  {
    label: "Vendas",
    href: "/vendas",
    icon: ShoppingCart,
  },
  {
    label: "Financeiro",
    href: "/financeiro",
    icon: Wallet,
  },
  {
    label: "Comissões",
    href: "/comissoes",
    icon: Percent,
  },
  {
    label: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
  },
];

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Novo agendamento",
    description: "Maria Silva agendou Corte Feminino às 14h",
    time: "há 5 min",
    unread: true,
  },
  {
    id: 2,
    title: "Pagamento recebido",
    description: "R$ 180,00 recebido via PIX",
    time: "há 1h",
    unread: true,
  },
  {
    id: 3,
    title: "Lembrete",
    description: "3 agendamentos para amanhã",
    time: "há 3h",
    unread: false,
  },
];

function Sidebar({ collapsed, mobileOpen, onCloseMobile, pathname }) {
  const { isSuperAdmin } = usePermissions();
  const { profile, company } = useAuth();

  const activeHref = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href);
  };

  const sidebarClasses = cn(
    "flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300 z-40",
    collapsed ? "lg:w-16" : "lg:w-64",
    "w-64 lg:relative lg:shrink-0",
    mobileOpen
      ? "fixed inset-y-0 left-0 translate-x-0 shadow-xl"
      : "fixed inset-y-0 left-0 -translate-x-full lg:translate-x-0"
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}
      <aside className={sidebarClasses}>
        <div
          className={cn(
            "h-16 flex items-center border-b border-slate-200 px-4 shrink-0",
            collapsed ? "lg:justify-center lg:px-2" : "justify-between"
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg text-slate-900 tracking-tight lg:block hidden">
                AgendPro
              </span>
            )}
          </Link>
          <button
            type="button"
            className="lg:hidden p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
            onClick={onCloseMobile}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
          {MENU_ITEMS.map((item) => {
            const active = activeHref(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={onCloseMobile}>
                <a
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    collapsed ? "lg:justify-center lg:px-2" : ""
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-brand-600" />
                  )}
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      active ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  {!collapsed && <span className="lg:block hidden">{item.label}</span>}
                  {item.label === "Notificações" && !collapsed && (
                    <Badge variant="danger" className="ml-auto lg:block hidden">
                      2
                    </Badge>
                  )}
                </a>
              </Link>
            );
          })}

          <Link href="/configuracoes" onClick={onCloseMobile}>
            <a
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                activeHref("/configuracoes")
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                collapsed ? "lg:justify-center lg:px-2" : ""
              )}
              title={collapsed ? "Configurações" : undefined}
            >
              {activeHref("/configuracoes") && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-brand-600" />
              )}
              <Settings
                className={cn(
                  "h-5 w-5 shrink-0",
                  activeHref("/configuracoes")
                    ? "text-brand-600"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              {!collapsed && <span className="lg:block hidden">Configurações</span>}
            </a>
          </Link>

          {isSuperAdmin() && (
            <>
              <div className={cn("my-3 border-t border-slate-200", collapsed ? "lg:mx-2" : "mx-1")} />
              <Link href="/super-admin" onClick={onCloseMobile}>
                <a
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                    activeHref("/super-admin")
                      ? "bg-purple-50 text-purple-700"
                      : "text-slate-600 hover:bg-purple-50 hover:text-purple-700",
                    collapsed ? "lg:justify-center lg:px-2" : ""
                  )}
                  title={collapsed ? "Super Admin" : undefined}
                >
                  {activeHref("/super-admin") && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-purple-600" />
                  )}
                  <Shield
                    className={cn(
                      "h-5 w-5 shrink-0",
                      activeHref("/super-admin")
                        ? "text-purple-600"
                        : "text-slate-400 group-hover:text-purple-600"
                    )}
                  />
                  {!collapsed && (
                    <>
                      <span className="lg:block hidden">Super Admin</span>
                      <Badge variant="muted" className="ml-auto lg:block hidden">
                        Admin
                      </Badge>
                    </>
                  )}
                </a>
              </Link>
            </>
          )}
        </nav>

        <div
          className={cn(
            "border-t border-slate-200 p-3 shrink-0",
            collapsed ? "lg:px-2" : ""
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg p-2",
              collapsed ? "lg:justify-center" : ""
            )}
          >
            <Avatar
              size="sm"
              name={profile?.full_name || profile?.email || "Usuário"}
              src={profile?.avatar_url}
            />
            {!collapsed && (
              <div className="flex-1 min-w-0 lg:block hidden">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {profile?.full_name || profile?.email || "Usuário"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {company?.name || "v1.0.0"}
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <p className="text-[10px] text-slate-400 text-center lg:block hidden mt-1">
              AgendPro v1.0.0
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

function Topbar({ onToggleSidebar, onToggleMobile }) {
  const { profile, companies, company, setCompany, signOut } = useAuth();
  const { toast } = useToast?.() || { toast: () => {} };
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(2);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (err) {
      toast?.({ title: "Erro", description: err.message, variant: "error" });
    }
  };

  const multipleCompanies = companies && companies.length > 1;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-6 gap-3 shrink-0 sticky top-0 z-20">
      <button
        type="button"
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        onClick={onToggleMobile}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <button
        type="button"
        className="hidden lg:block p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        onClick={onToggleSidebar}
        aria-label="Alternar menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1 max-w-2xl min-w-0">
        <Input
          placeholder="Buscar cliente, agendamento, serviço..."
          leftIcon={<Search className="h-4 w-4" />}
          className="max-w-xl"
        />
      </div>

      <div className="flex items-center gap-2">
        {multipleCompanies && (
          <DropdownMenu align="end">
            <DropdownTrigger asChild>
              <button
                type="button"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200"
              >
                <Building2 className="h-4 w-4 text-slate-400" />
                <span className="max-w-[140px] truncate">{company?.name || "Empresa"}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            </DropdownTrigger>
            <DropdownContent>
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Trocar empresa
              </div>
              {companies.map((c) => (
                <DropdownItem
                  key={c.id}
                  onClick={() => setCompany(c)}
                  className={cn(
                    company?.id === c.id && "bg-brand-50 text-brand-700"
                  )}
                >
                  <Building2 className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="truncate font-medium">{c.name}</div>
                    <div className="text-xs text-slate-500 truncate">{c.slug}</div>
                  </div>
                  {company?.id === c.id && (
                    <Badge variant="info" size="sm">
                      Atual
                    </Badge>
                  )}
                </DropdownItem>
              ))}
            </DropdownContent>
          </DropdownMenu>
        )}

        <DropdownMenu align="end">
          <DropdownTrigger asChild>
            <button
              type="button"
              className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600"
              aria-label="Notificações"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-[16px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownTrigger>
          <DropdownContent className="w-80 !p-0">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-semibold text-sm text-slate-900">Notificações</h4>
              <button
                type="button"
                className="text-xs text-brand-600 font-medium hover:underline"
                onClick={() => setUnreadCount(0)}
              >
                Marcar lidas
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {MOCK_NOTIFICATIONS.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer",
                    n.unread && "bg-brand-50/40"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full mt-2 shrink-0",
                        n.unread ? "bg-brand-500" : "bg-transparent"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {n.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-slate-200">
              <button
                type="button"
                className="w-full text-sm text-brand-600 font-medium hover:underline py-1"
              >
                Ver todas notificações
              </button>
            </div>
          </DropdownContent>
        </DropdownMenu>

        <DropdownMenu align="end">
          <DropdownTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-slate-100"
            >
              <Avatar
                size="sm"
                name={profile?.full_name || profile?.email || "Usuário"}
                src={profile?.avatar_url}
              />
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate max-w-[140px]">
                  {profile?.full_name || profile?.email || "Usuário"}
                </p>
                <p className="text-xs text-slate-500 truncate max-w-[140px]">
                  {profile?.email || ""}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
            </button>
          </DropdownTrigger>
          <DropdownContent>
            <div className="px-3 py-2 border-b border-slate-200 mb-1">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {profile?.full_name || profile?.email || "Usuário"}
              </p>
              <p className="text-xs text-slate-500 truncate">{profile?.email || ""}</p>
            </div>
            <DropdownItem onClick={() => router.push("/perfil")}>
              <User className="h-4 w-4" />
              Meu Perfil
            </DropdownItem>
            <DropdownItem onClick={() => router.push("/configuracoes")}>
              <Settings className="h-4 w-4" />
              Configurações
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem onClick={handleSignOut} className="!text-red-600 hover:!bg-red-50">
              <LogOut className="h-4 w-4" />
              Sair
            </DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!initialized || loading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [initialized, loading, user, router]);

  if (loading || !initialized || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
          <p className="text-sm text-slate-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        pathname={router.pathname}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
          onToggleMobile={() => setMobileOpen((o) => !o)}
        />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
}
