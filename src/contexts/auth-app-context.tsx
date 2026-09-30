'use client';
import { ApiApp } from '@/lib/api-app';
import { KEY_PERMISSOES_LOJA } from '@/utils/types/permissoes_funcionalidades.enum';
import { usePathname, useRouter } from 'next/navigation';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface AuthAppContextType {
  user: string | null;
  token: string | null;
  login: (username: string, token: string) => void;
  logout: () => void;
  getUser: () => {
    id: string;
    perfil: string;
    nome: string;
  } | null;
  fetchPermissions: () => Promise<{
    roles: string[];
    permissions: KEY_PERMISSOES_LOJA[];
    fetchedAt: Date;
  } | null>;
}

const AuthAppContext = createContext<AuthAppContextType | undefined>(undefined);

const AuthAppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [accessData, setAccessData] = useState<{
    roles: string[];
    permissions: KEY_PERMISSOES_LOJA[];
    fetchedAt: Date;
  } | null>(null);

  const accessPromiseRef =
    React.useRef<
      Promise<{
        roles: string[];
        permissions: KEY_PERMISSOES_LOJA[];
        fetchedAt: Date;
      } | null> | null
    >(null);

  const [accessFetchedAtMs, setAccessFetchedAtMs] = useState<number | null>(
    null
  );
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathName = usePathname();
  const api = new ApiApp();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const storedUser = localStorage.getItem('usuario');
    const storedToken = localStorage.getItem('token');

    if (!storedUser || !storedToken) {
      router.push(
        `/autenticacao/login?redirect=${encodeURIComponent(pathName)}`
      );
      return;
    }

    setUser(storedUser);
    setToken(storedToken);
  }, [isClient]);

  const login = (user: string, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('usuario', user);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAccessData(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    window.location.href = '/autenticacao/login';
  };

  const getUser = () => {
    return JSON.parse(user || '{}');
  };

  const fetchPermissions = async () => {
    const fiveMinutes = 5 * 60 * 1000;
    if (
      accessData &&
      accessFetchedAtMs &&
      Date.now() - accessFetchedAtMs < fiveMinutes
    ) {
      return accessData;
    }

    if (accessPromiseRef.current) {
      return accessPromiseRef.current;
    }

    const promise = (async () => {
      const [data, error] = await api.auth.acesso();
      if (error || !data) {
        return null;
      }
      setAccessData({
        roles: data.cargo,
        permissions: data.permissao,
        fetchedAt: data.consultaEm,
      });
      setAccessFetchedAtMs(Date.now());
      return {
        roles: data.cargo,
        permissions: data.permissao,
        fetchedAt: data.consultaEm,
      };
    })();

    accessPromiseRef.current = promise;
    try {
      return await promise;
    } finally {
      accessPromiseRef.current = null;
    }
  };

  return (
    <AuthAppContext.Provider
      value={{ user, token, login, logout, getUser, fetchPermissions }}
    >
      {children}
    </AuthAppContext.Provider>
  );
};

const useAppAuth = () => {
  const context = useContext(AuthAppContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthAppProvider, useAppAuth };
