'use client';
import { usePathname,useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiBackOffice } from '@/lib/api-backoffice';
import { KEY_PERMISSOES_AUTOPILOT } from '@/utils/types/permissoes_funcionalidades.enum';

interface AuthBackOfficeContextType {
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
    permissions: KEY_PERMISSOES_AUTOPILOT[];
    fetchedAt: Date;
  } | null>;
}

const AuthBackOfficeContext = createContext<AuthBackOfficeContextType | undefined>(undefined);

const AuthBackOfficeProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [accessData, setAccessData] = useState<{
    roles: string[];
    permissions: KEY_PERMISSOES_AUTOPILOT[];
    fetchedAt: Date;
  } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathName = usePathname();
  const api = new ApiBackOffice();

  const accessPromiseRef = React.useRef<
    Promise<{
      roles: string[];
      permissions: KEY_PERMISSOES_AUTOPILOT[];
      fetchedAt: Date;
    } | null> | null
  >(null);

  const [accessFetchedAtMs, setAccessFetchedAtMs] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if( !isClient ) return;
    const storedUser = localStorage.getItem('usuario-backoffice');
    const storedToken = localStorage.getItem('token-backoffice');

    if( !storedUser || !storedToken ) {
      // router.push('/backoffice/autenticacao/login?redirect=' + pathName);
    }

    setUser(storedUser);
    setToken(storedToken);

  }, [isClient]);

  const login = (username: string, token: string) => {
    setUser(username);
    setToken(token);
    localStorage.setItem('user-backoffice', username);
    localStorage.setItem('token-backoffice', token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAccessData(null);
    localStorage.removeItem('user-backoffice');
    localStorage.removeItem('token-backoffice');
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
      try {
        const [response, error] = await api.auth.acesso();
        if (error || !response) {
          return null;
        }
        
        const data = response.data;

        if(!data) {
          return null;
        }

        const accessData = {
          roles: data.cargo,
          permissions: data.permissao as KEY_PERMISSOES_AUTOPILOT[],
          fetchedAt: new Date(data.consultaEm),
        };
        
        setAccessData(accessData);
        setAccessFetchedAtMs(Date.now());
        return accessData;
      } catch (error) {
        console.error('Erro ao buscar permissões:', error);
        return null;
      }
    })();

    accessPromiseRef.current = promise;
    try {
      return await promise;
    } finally {
      accessPromiseRef.current = null;
    }
  };

  return (
    <AuthBackOfficeContext.Provider value={{ user, token, login, logout, getUser, fetchPermissions }}>
      {children}
    </AuthBackOfficeContext.Provider>
  );
};

const useAuthBackOffice = () => {
  const context = useContext(AuthBackOfficeContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthBackOfficeProvider, useAuthBackOffice };