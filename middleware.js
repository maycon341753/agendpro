import { NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/agenda",
  "/agendamentos",
  "/clientes",
  "/servicos",
  "/profissionais",
  "/vendas",
  "/financeiro",
  "/comissoes",
  "/relatorios",
  "/configuracoes",
  "/perfil",
  "/setup",
];

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/cadastro",
  "/recuperar-senha",
  "/alterar-senha",
  "/confirmar-email",
  "/agendar",
  "/empresa",
  "/api",
];

const SUPER_ADMIN_ROUTES = ["/super-admin"];

function isProtected(pathname) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function isPublic(pathname) {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return PUBLIC_ROUTES.some(
    (route) => pathname.startsWith(route + "/") || pathname === route
  );
}

function isSuperAdminRoute(pathname) {
  return SUPER_ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function hasAccessToken(request) {
  const cookies = request.cookies;
  const accessToken = cookies.get("sb-access-token");
  if (accessToken?.value) return true;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return true;
  return false;
}

function getUserRoleFromToken(request) {
  try {
    const cookies = request.cookies;
    const accessToken = cookies.get("sb-access-token");
    if (accessToken?.value) {
      const parts = accessToken.value.split(".");
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        return (
          payload.role ||
          payload.user_role ||
          payload.app_metadata?.role ||
          payload.user_metadata?.role ||
          null
        );
      }
    }
  } catch (error) {
    console.warn("Erro ao decodificar token no middleware:", error);
  }
  return null;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/static") || pathname.includes(".")) {
    return NextResponse.next();
  }

  if (isSuperAdminRoute(pathname)) {
    if (!hasAccessToken(request)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const role = getUserRoleFromToken(request);
    if (role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isProtected(pathname) && !isPublic(pathname)) {
    if (!hasAccessToken(request)) {
      console.warn(`[MIDDELWARE] Rota ${pathname} exige auth mas cookie 'sb-access-token' nao encontrado (Supabase por padrão usa localStorage). Permitindo request, as paginas tem guards client-side proprios.`);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
