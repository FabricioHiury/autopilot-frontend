import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicPaths = [
    "/",
    "/autenticacao",
    "/app/configuracoes/integracoes/acesso/instagram",
    "/app/configuracoes/integracoes/acesso/facebook",
    "/app/configuracoes/integracoes/acesso/olx",
  ];

  const isPublicPath = publicPaths.some(
    (pubPath) => path === pubPath || path.startsWith(pubPath + "/")
  );
  if (isPublicPath) {
    return NextResponse.next();
  }

  const isPrivateArea =
    path.startsWith("/app") || path.startsWith("/backoffice");
  if (!isPrivateArea) {
    return NextResponse.next();
  }

  const isBackofficePath = path.startsWith("/backoffice");
  const cookieName = isBackofficePath
    ? "secure_token_backoffice"
    : "secure_token";
  const token = request.cookies.get(cookieName)?.value;

  if (!token) {
    const loginUrl = `/autenticacao/login?redirect=${encodeURIComponent(path)}`;
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/backoffice/:path*"],
};
