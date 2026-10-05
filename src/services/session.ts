import Cookies from 'js-cookie';
import type { AuthSession } from '@/types/auth';
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const key = window.location.pathname.startsWith('/backoffice') ? 'token-backoffice' : 'token';
  return localStorage.getItem(key) || null;
}
export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('session') || 'null');
  } catch {
    return null;
  }
}
export function tokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}
export function clearSession() {
  if (typeof window === 'undefined') return;
  for (const key of [
    'token',
    'token-backoffice',
    'user',
    'user-backoffice',
    'usuario',
    'usuario-backoffice',
    'session',
  ])
    localStorage.removeItem(key);
  Cookies.remove('secure_token', { path: '/' });
  Cookies.remove('secure_token_backoffice', { path: '/' });
  window.dispatchEvent(new Event('autopilot:session-changed'));
}
export function saveSession(session: AuthSession) {
  clearSession();
  const expiry = tokenExpiry(session.token);
  if (!expiry || expiry <= Date.now())
    throw new Error('O servidor retornou uma sessão inválida ou expirada.');
  const admin = session.profile === 'autopilot';
  localStorage.setItem(admin ? 'token-backoffice' : 'token', session.token);
  localStorage.setItem(admin ? 'user-backoffice' : 'user', JSON.stringify(session));
  localStorage.setItem('session', JSON.stringify(session));
  Cookies.set(admin ? 'secure_token_backoffice' : 'secure_token', session.token, {
    expires: new Date(expiry),
    secure: window.location.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
  });
  window.dispatchEvent(new Event('autopilot:session-changed'));
}
