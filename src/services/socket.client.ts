import { io, type Socket } from 'socket.io-client';
import { API_URL } from './api.client';
import type { Message } from '@/types/message';
import type { CopilotInsight } from '@/types/copilot';
export interface ChatEvent {
  storeId: string;
  chatId: string;
  message: Message;
}
export interface AnalysisEvent {
  storeId: string;
  chatId: string;
  insight: CopilotInsight;
  analyzedAt: string;
}
export interface ServerEvents {
  'message:received': (event: ChatEvent) => void;
  'message:status': (event: ChatEvent) => void;
  'deal:created': (event: {
    storeId: string;
    deal: {
      id: string;
    };
  }) => void;
  'autopilot:analysis-ready': (event: AnalysisEvent) => void;
}
export function createChatSocket(token: string): Socket<ServerEvents> {
  return io(`${(process.env.NEXT_PUBLIC_SOCKET_URL || API_URL).replace(/\/$/, '')}/chats`, {
    auth: { token },
    autoConnect: false,
    reconnection: true,
  });
}
