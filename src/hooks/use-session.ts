'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthSession } from '@/types/auth';
import { apiClient, apiError, requestData } from '@/services/api.client';
import { clearSession, getSession, saveSession, tokenExpiry } from '@/services/session';
import { fetchAccess, type AccessData } from '@/services/auth-access';
export function useSession<P extends string>(admin: boolean) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const cache = useRef<AccessData<P> | null>(null);
  const pending = useRef<Promise<AccessData<P> | null> | null>(null);
  const validate = useCallback(async () => {
    const current = getSession();
    if (!current || (tokenExpiry(current.token) || 0) <= Date.now()) {
      clearSession();
      router.replace('/auth/login');
      return;
    }
    if ((current.profile === 'autopilot') !== admin) {
      router.replace(
        current.profile === 'autopilot' ? '/backoffice/app/dashboard' : '/app/dashboard',
      );
      return;
    }
    try {
      const result = await requestData<{
        authenticated: boolean;
      }>(apiClient.post('/auth/validate'));
      if (getSession()?.token !== current.token) return;
      if (!result.authenticated) {
        clearSession();
        router.replace('/auth/login');
        return;
      }
      setSession(current);
      setReady(true);
      setError(null);
    } catch (err) {
      setError(apiError(err).message);
    }
  }, [admin, router]);
  useEffect(() => {
    void validate();
  }, [validate]);
  useEffect(() => {
    if (!session) return;
    const expire = () => {
      cache.current = null;
      pending.current = null;
      setReady(false);
      setSession(null);
      clearSession();
      router.replace('/auth/login');
    };
    let timer: ReturnType<typeof setTimeout>;
    function schedule() {
      const remaining = (tokenExpiry(session!.token) || 0) - Date.now();
      if (remaining <= 0) expire();
      else timer = setTimeout(schedule, Math.min(remaining, 2147483647));
    }
    schedule();
    const changed = () => {
      const next = getSession();
      if (!next) expire();
      else if (next.token !== session.token) {
        cache.current = null;
        pending.current = null;
        setReady(false);
        setSession(null);
        void validate();
      }
    };
    window.addEventListener('storage', changed);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', changed);
    };
  }, [session, router, validate]);
  const permissions = useCallback(async () => {
    if (cache.current && Date.now() - cache.current.fetchedAt.getTime() < 300000)
      return cache.current;
    if (pending.current) return pending.current;
    const expectedToken = getSession()?.token;
    const operation = fetchAccess<P>(admin)
      .then((data) => (getSession()?.token === expectedToken ? (cache.current = data) : null))
      .catch(() => null)
      .finally(() => {
        if (pending.current === operation) pending.current = null;
      });
    pending.current = operation;
    return operation;
  }, [admin]);
  const value = useMemo(
    () => ({
      user: session ? JSON.stringify(session) : null,
      token: session?.token || null,
      getUser: () => session,
      login: (user: string, token: string) => {
        const data = { ...JSON.parse(user), token };
        saveSession(data);
        setSession(data);
      },
      logout: () => {
        cache.current = null;
        pending.current = null;
        setReady(false);
        setSession(null);
        clearSession();
        router.replace('/auth/login');
      },
      fetchPermissions: permissions,
    }),
    [session, permissions, router],
  );
  return { value, ready, error, retry: validate };
}
