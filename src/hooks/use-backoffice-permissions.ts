'use client';

import { useEffect, useState } from 'react';
import { useAuthBackOffice } from '@/contexts/auth-backoffice-context';
import { AdminPermission } from '@/types/permissions';

export function useBackofficePermissions() {
  const { fetchPermissions } = useAuthBackOffice();
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    async function load() {
      try {
        const access = await fetchPermissions();
        if (!active) return;
        if (!access) throw new Error('Permissions unavailable');
        setPermissions(access.permissions);
      } catch {
        if (active) setError('Não foi possível carregar os acessos do menu.');
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [fetchPermissions, attempt]);

  return { permissions, isLoading, error, retry: () => setAttempt((value) => value + 1) };
}
