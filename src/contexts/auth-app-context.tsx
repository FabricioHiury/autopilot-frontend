'use client';
import { createContext, useContext, type ReactNode } from 'react';
import { useSession } from '@/hooks/use-session';
import { StorePermission } from '@/types/permissions';
const AuthAppContext = createContext<
  ReturnType<typeof useSession<StorePermission>>['value'] | undefined
>(undefined);
export function AuthAppProvider({ children }: { children: ReactNode }) {
  const { value, ready, error, retry } = useSession<StorePermission>(false);
  if (error)
    return (
      <div className="min-h-screen grid place-content-center gap-4 text-center p-6">
        <p>{error}</p>
        <button onClick={() => void retry()} className="text-primary">
          Tentar novamente
        </button>
      </div>
    );
  if (!ready)
    return <div className="min-h-screen grid place-content-center">Validando sua sessão…</div>;
  return <AuthAppContext.Provider value={value}>{children}</AuthAppContext.Provider>;
}
export function useAppAuth() {
  const value = useContext(AuthAppContext);
  if (!value) throw new Error('useAppAuth requires AuthAppProvider');
  return value;
}
