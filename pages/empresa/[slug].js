import React from "react";
import Head from "next/head";
import Link from "next/link";
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Calendar,
  ChevronRight,
  Scissors,
  Star,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { ServiceCard } from "@/components/public";
import { getBySlug } from "@/services/companyService";
import { formatCurrencyBRL, formatPhone } from "@/utils/format";
import { DAYS_OF_WEEK, BUSINESS_TYPES } from "@/utils/constants";
import { cn } from "@/utils/cn";

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const company = await getBySlug(slug);

  if (!company) {
    return { notFound: true };
  }

  return {
    props: {
      company: JSON.parse(JSON.stringify(company)),
    },
  };
}

export default function EmpresaPage({ company }) {
  const brandColor = company.colorPrimary || "#ec4899";
  const styleVars = { "--brand-color": brandColor };

  const businessTypeLabel = React.useMemo(() => {
    const found = BUSINESS_TYPES.find((b) => b.value === company.businessType);
    return found?.label || "Estabelecimento";
  }, [company.businessType]);

  const formatWorkHours = () => {
    if (!company.workHours) return [];
    const hours = [];

    const schedule = Object.entries(company.workHours).map(([day, cfg]) => ({
      day: Number(day),
      ...cfg,
    }));

    let i = 0;
    while (i < schedule.length) {
      if (!schedule[i].enabled) {
        hours.push({
          label: DAYS_OF_WEEK[schedule[i].day].label,
          value: "Fechado",
          isClosed: true,
        });
        i++;
        continue;
      }

      const current = schedule[i];
      let end = i;
      while (
        end + 1 < schedule.length &&
        schedule[end + 1].enabled &&
        schedule[end + 1].openTime === current.openTime &&
        schedule[end + 1].closeTime === current.closeTime &&
        schedule[end + 1].breakStart === current.breakStart &&
        schedule[end + 1].breakEnd === current.breakEnd
      ) {
        end++;
      }

      const label =
        i === end
          ? DAYS_OF_WEEK[current.day].label
          : `${DAYS_OF_WEEK[current.day].shortLabel} a ${DAYS_OF_WEEK[schedule[end].day].shortLabel}`;

      const breakInfo =
        current.breakStart && current.breakEnd
          ? ` (intervalo ${current.breakStart}-${current.breakEnd})`
          : "";

      hours.push({
        label,
        value: `${current.openTime} às ${current.closeTime}${breakInfo}`,
        isClosed: false,
      });

      i = end + 1;
    }

    return hours;
  };

  const workHoursList = formatWorkHours();

  return (
    <div style={styleVars} className="min-h-screen bg-slate-50">
      <Head>
        <title>{company.name} - Agendamento Online</title>
        <meta name="description" content={company.description || `Agende online no ${company.name}`} />
      </Head>

      <div
        className="w-full h-48 sm:h-64 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${brandColor} 0%, ${company.colorSecondary || brandColor}aa 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/30" />
          <div className="absolute top-10 -left-10 h-40 w-40 rounded-full bg-white/20" />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 -mt-24 sm:-mt-28 relative z-10 pb-16">
        <Card className="mb-8 shadow-lg overflow-visible">
          <CardBody className="pt-0">
            <div className="-mt-16 sm:-mt-20 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
                <Avatar
                  src={company.logo}
                  name={company.name}
                  size="xl"
                  className="ring-4 ring-white shadow-xl bg-white"
                  style={company.logo ? {} : { backgroundColor: `${brandColor}20`, color: brandColor }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                      {company.name}
                    </h1>
                    <Badge variant="info">{businessTypeLabel}</Badge>
                  </div>
                  {company.description && (
                    <p className="text-slate-600 mt-2 text-sm sm:text-base">
                      {company.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                    <span className="text-xs text-slate-500 ml-1.5">
                      (4.9) • 128 avaliações
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {company.address && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                  >
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">Endereço</p>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {company.address}
                      {company.city && `, ${company.city}`}
                      {company.state && ` - ${company.state}`}
                    </p>
                    {company.zipCode && (
                      <p className="text-xs text-slate-500 mt-0.5">CEP: {company.zipCode}</p>
                    )}
                  </div>
                </div>
              )}

              {company.phone && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                  >
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">Telefone</p>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {formatPhone(company.phone)}
                    </p>
                  </div>
                </div>
              )}

              {company.whatsapp && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-green-50 text-green-600">
                    <MessageCircle className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">WhatsApp</p>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {formatPhone(company.whatsapp)}
                    </p>
                  </div>
                </div>
              )}

              {company.email && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                  >
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">E-mail</p>
                    <p className="text-sm text-slate-600 mt-0.5 break-all">
                      {company.email}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-lg bg-slate-50 mb-6">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                >
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Horário de funcionamento
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 pl-12">
                {workHoursList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 text-sm border-b border-slate-200/50 last:border-0">
                    <span className="text-slate-600">{item.label}</span>
                    <span
                      className={cn(
                        "font-medium",
                        item.isClosed ? "text-red-500" : "text-slate-900"
                      )}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Link href={`/agendar/${company.slug}`} className="block">
              <Button
                size="lg"
                className="w-full h-14 sm:h-16 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
                icon={<Calendar className="h-5 w-5 sm:h-6 sm:w-6" />}
                iconRight={<ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />}
                style={{ backgroundColor: brandColor }}
              >
                Agendar agora
              </Button>
            </Link>
          </CardBody>
        </Card>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Nossos serviços
              </h2>
              <p className="text-sm text-slate-500">
                Confira o que oferecemos
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(company.services || []).slice(0, 6).map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                selected={false}
                onSelect={() => routerPush(`/agendar/${company.slug}`)}
              />
            ))}
          </div>

          {(company.services || []).length > 6 && (
            <div className="mt-6 text-center">
              <Link href={`/agendar/${company.slug}`}>
                <Button variant="outline" iconRight={<ChevronRight className="h-4 w-4" />}>
                  Ver todos os serviços
                </Button>
              </Link>
            </div>
          )}
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              <Star className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Nossa equipe
              </h2>
              <p className="text-sm text-slate-500">
                Profissionais qualificados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(company.professionals || []).map((pro) => (
              <Card key={pro.id} className="text-center hover:shadow-md transition-shadow">
                <CardBody>
                  <Avatar
                    src={pro.avatar}
                    name={pro.name}
                    size="xl"
                    className="mx-auto mb-4"
                    style={pro.avatar ? {} : { backgroundColor: `${pro.color || brandColor}20`, color: pro.color || brandColor }}
                  />
                  <h3 className="font-semibold text-slate-900">{pro.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{pro.role}</p>
                  <div className="flex items-center justify-center gap-1 mt-3">
                    <Badge variant="muted" className="text-[10px]">
                      {(pro.services || []).length} serviços
                    </Badge>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Localização e contato
              </h2>
              <p className="text-sm text-slate-500">
                Venha nos visitar
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <div
                className="h-56 sm:h-64 w-full flex items-center justify-center relative"
                style={{
                  background: `linear-gradient(135deg, ${brandColor}15 0%, ${brandColor}05 100%)`,
                }}
              >
                <MapPin
                  className="h-16 w-16 opacity-30"
                  style={{ color: brandColor }}
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                    <p className="text-sm font-medium text-slate-900">
                      {company.address || "Endereço"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {company.city && `${company.city}${company.state ? ` - ${company.state}` : ""}`}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardBody className="space-y-4">
                {company.whatsapp && (
                  <Link
                    href={`https://wa.me/${String(company.whatsapp).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 border-green-200 hover:bg-green-50"
                      icon={
                        <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 text-white" />
                        </div>
                      }
                    >
                      <div className="text-left ml-1">
                        <p className="text-sm font-semibold text-slate-900">
                          Falar no WhatsApp
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatPhone(company.whatsapp)}
                        </p>
                      </div>
                    </Button>
                  </Link>
                )}

                {company.phone && (
                  <Link href={`tel:${String(company.phone).replace(/\D/g, "")}`} className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12"
                      icon={
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                        >
                          <Phone className="h-4 w-4" />
                        </div>
                      }
                    >
                      <div className="text-left ml-1">
                        <p className="text-sm font-semibold text-slate-900">
                          Ligar
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatPhone(company.phone)}
                        </p>
                      </div>
                    </Button>
                  </Link>
                )}

                {company.email && (
                  <Link href={`mailto:${company.email}`} className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12"
                      icon={
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                        >
                          <Mail className="h-4 w-4" />
                        </div>
                      }
                    >
                      <div className="text-left ml-1">
                        <p className="text-sm font-semibold text-slate-900">
                          Enviar e-mail
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">
                          {company.email}
                        </p>
                      </div>
                    </Button>
                  </Link>
                )}

                <div className="pt-4 mt-2 border-t border-slate-100">
                  <Link href={`/agendar/${company.slug}`}>
                    <Button
                      className="w-full h-12"
                      icon={<Calendar className="h-4 w-4" />}
                      style={{ backgroundColor: brandColor }}
                    >
                      Agendar atendimento
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={company.logo}
                name={company.name}
                size="sm"
                style={company.logo ? {} : { backgroundColor: `${brandColor}20`, color: brandColor }}
              />
              <div>
                <p className="font-semibold text-sm text-slate-900">{company.name}</p>
                <p className="text-xs text-slate-500">© {new Date().getFullYear()} Todos os direitos reservados</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <a href="#" className="hover:text-slate-700">Termos</a>
              <a href="#" className="hover:text-slate-700">Privacidade</a>
              <Link href="/meus-agendamentos" className="hover:text-slate-700 font-medium text-slate-700">
                Meus agendamentos
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function routerPush(url) {
  if (typeof window !== "undefined") {
    window.location.href = url;
  }
}
