import Link from "next/link";
import { useState } from "react";
import { Calendar, Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Benefícios", href: "#beneficios" },
    { label: "Como Funciona", href: "#como-funciona" },
    { label: "Recursos", href: "#recursos" },
    { label: "Planos", href: "#planos" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <nav className="container-default h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900">AgendPro</span>
          </Link>

          <ul className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="btn-ghost">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-primary">
              Começar grátis
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-slate-900">AgendPro</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Fechar menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <ul className="flex-1 p-4 space-y-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="p-4 border-t border-slate-200 space-y-3">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full btn-secondary"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                onClick={() => setMobileOpen(false)}
                className="w-full btn-primary"
              >
                Começar grátis
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="h-16" />
    </>
  );
}
