import { NextResponse, type NextRequest } from 'next/server';
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith('/backoffice/auth'))
    return NextResponse.redirect(new URL('/auth/login', request.url));
  const admin = path.startsWith('/backoffice/app');
  const token = request.cookies.get(admin ? 'secure_token_backoffice' : 'secure_token')?.value;
  try {
    if (!token) throw new Error('Missing session');
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp || payload.exp * 1000 <= Date.now()) throw new Error('Expired session');
    return NextResponse.next();
  } catch {
    const login = new URL('/auth/login', request.url);
    login.searchParams.set('redirect', path);
    return NextResponse.redirect(login);
  }
}
export const config = { matcher: ['/app/:path*', '/backoffice/:path*'] };
