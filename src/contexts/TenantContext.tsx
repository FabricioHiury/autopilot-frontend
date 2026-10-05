'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { tenantService } from '@/services/tenant.service';
import type { TenantConfig } from '@/types/store';
import { applyTenantTheme } from '@/lib/tenant-theme';
import { useAppAuth } from './auth-app-context';
const TenantContext = createContext<{
  tenant: TenantConfig | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setTenant: (tenant: TenantConfig) => void;
} | null>(null);
export function TenantProvider({ children }: { children: ReactNode }) {
  const { token } = useAppAuth();
  const [tenant, setTenant] = useState<TenantConfig | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const reload = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true);
    try {
      const result = await tenantService.getCustomization();
      if (request === generation.current) {
        setTenant(result);
        setError(null);
      }
    } catch (err) {
      if (request === generation.current)
        setError(
          err instanceof Error ? err.message : 'Não foi possível carregar a identidade visual.',
        );
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    setTenant(null);
    if (token) void reload();
    else setLoading(false);
    return () => {
      generation.current++;
    };
  }, [token, reload]);
  useEffect(() => {
    applyTenantTheme(tenant);
    return () => applyTenantTheme(null);
  }, [tenant]);
  return (
    <TenantContext.Provider value={{ tenant, loading, error, reload, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
}
export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant requires TenantProvider');
  return context;
}
export function useOptionalTenant() {
  return useContext(TenantContext);
}
