'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import { createChatSocket, type ServerEvents } from '@/services/socket.client';
import { useAppAuth } from './auth-app-context';
const RealtimeContext = createContext<Socket<ServerEvents> | null>(null);
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const auth = useAppAuth();
  const token = auth.token,
    storeId = auth.getUser()?.storeId;
  const [socket, setSocket] = useState<Socket<ServerEvents> | null>(null);
  useEffect(() => {
    if (!token || !storeId) return;
    const connection = createChatSocket(token);
    setSocket(connection);
    connection.on('deal:created', (event) => {
      if (event.storeId === storeId) window.dispatchEvent(new Event('autopilot:deals-changed'));
    });
    connection.on('connect', () => window.dispatchEvent(new Event('autopilot:deals-changed')));
    connection.connect();
    return () => {
      connection.removeAllListeners();
      connection.disconnect();
      setSocket(null);
    };
  }, [token, storeId]);
  return <RealtimeContext.Provider value={socket}>{children}</RealtimeContext.Provider>;
}
export function useChatSocket() {
  return useContext(RealtimeContext);
}
