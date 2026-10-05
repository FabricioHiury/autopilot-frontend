'use client';
import { createContext, useContext, type ReactNode } from 'react';
import { useSession } from '@/hooks/use-session';
import { AdminPermission } from '@/types/permissions';
const AuthBackOfficeContext = createContext<
  ReturnType<typeof useSession<AdminPermission>>['value'] | undefined
>(undefined);
export function AuthBackOfficeProvider({ children }: { children: ReactNode }) {
  const { value, ready, error, retry } = useSession<AdminPermission>(true);
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
  return <AuthBackOfficeContext.Provider value={value}>{children}</AuthBackOfficeContext.Provider>;
}
export function useAuthBackOffice() {
  const value = useContext(AuthBackOfficeContext);
  if (!value) throw new Error('useAuthBackOffice requires AuthBackOfficeProvider');
  return value;
}
