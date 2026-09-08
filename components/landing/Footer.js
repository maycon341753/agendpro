import Link from "next/link";
import { Calendar, Instagram, Facebook, MessageCircle, Linkedin } from "lucide-react";

export default function Footer() {
  const productLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Agenda", href: "/dashboard/agenda" },
    { label: "Clientes", href: "/dashboard/clientes" },
    { label: "Financeiro", href: "/dashboard/financeiro" },
    { label: "Planos", href: "#planos" },
  ];

  const companyLinks = [
    { label: "Sobre", href: "/sobre" },
    { label: "Contato", href: "/contato" },
    { label: "Blog", href: "/blog" },
    { label: "Termos", href: "/termos" },
    { label: "Privacidade", href: "/privacidade" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: MessageCircle, href: "#", label: "WhatsApp" },
    { icon: Linkedin, href: "#", label: "Linkedin" },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container-default py-16 sm:py-18 lg:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white">AgendPro</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 mb-5">
              Sistema de agendamento e gestão empresarial. Simples, moderno e feito para
              o seu negócio crescer.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  aria-label={s.label}
                  className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition-all"
                >
                  <s.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Produto</h4>
            <ul className="space-y-2.5">
              {productLinks.map((l, i) => (
                <li key={i}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Empresa</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((l, i) => (
                <li key={i}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-slate-500">✉️</span>
                <span>contato@agendpro.com.br</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-500">📱</span>
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-500">📍</span>
                <span>São Paulo, Brasil</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="container-default py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} AgendPro. Todos os direitos reservados.
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            Feito no Brasil com
            <span className="text-red-500 animate-pulse">❤️</span>
            por brasileiros.
          </p>
        </div>
      </div>
    </footer>
  );
}
