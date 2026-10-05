import { apiClient, apiError, type ApiResult } from './api.client';
import type { Chat } from '@/types/chat';
import type { Message } from '@/types/message';
interface ChatFilters {
  search: string;
  page: number;
  limit: number;
  ownChats: boolean;
  channel?: string;
  statusChat?: string;
  sorting?: 'recent' | 'previous';
  dataStart?: string;
  dataEnd?: string;
  idUserAssignee?: string;
}
export interface SendMessageInput {
  recipient: string;
  message: string;
  channel: string;
  attachmentUrl?: string;
  attachmentType?: string;
  quotedMessageId?: string;
}
function outgoing(input: SendMessageInput) {
  const { message, ...rest } = input;
  return { ...rest, text: message };
}
async function result<T>(
  promise: Promise<{
    data: {
      data: T;
    };
  }>,
): Promise<ApiResult<T>> {
  try {
    return [(await promise).data.data, null];
  } catch (error) {
    return [null, apiError(error)];
  }
}
export class ChatService {
  readonly chat = {
    listChats: (filters: ChatFilters) => {
      const { ownChats, ...params } = filters;
      return result<{
        chats: Chat[];
        page: number;
        limit: number;
      }>(apiClient.get('/chats', { params: { ...params, own: String(ownChats) } }));
    },
    listMessagesChat: (
      chatId: string,
      params: {
        search: string;
        page: number;
        limit: number;
      },
    ) =>
      result<{
        messages: Message[];
        page: number;
        limit: number;
        channel: string;
      }>(apiClient.get(`/chats/${encodeURIComponent(chatId)}/messages`, { params })),
    sendMessageChat: (chatId: string, input: SendMessageInput) =>
      result<{
        messageSent: Message;
      }>(apiClient.post(`/chats/${encodeURIComponent(chatId)}/messages`, outgoing(input))),
    generateAttachment: (chatId: string, file: File) => {
      const form = new FormData();
      form.append('files', file);
      return result<{
        src: string;
        mimetype: string;
      }>(apiClient.post(`/chats/generate-attachment/${encodeURIComponent(chatId)}`, form));
    },
    newChat: (
      params: {
        customerId: string;
        typeCustomer: 'customer' | 'temporary';
        name: string;
      },
      input: SendMessageInput,
    ) =>
      result<{
        chatId: string;
      }>(
        apiClient.post(
          '/chats/new-chat',
          { ...outgoing(input), channel: 'whatsapp' },
          { params: { ...params, mobile: input.recipient } },
        ),
      ),
    updateDeal: (params: { chatId: string; dealId: string }) =>
      result<Chat>(
        apiClient.put(
          `/chats/${encodeURIComponent(params.chatId)}/update-deal/${encodeURIComponent(params.dealId)}`,
        ),
      ),
    getChat: (chatId: string) =>
      result<Chat>(apiClient.get(`/chats/${encodeURIComponent(chatId)}`)),
    verifyWhatsapp: (number: string) =>
      result<{
        exists: boolean;
        number: string | null;
        numberSearch: string;
      }>(apiClient.get('/chats/number-whatsapp-available', { params: { number } })),
    findMessage: (messageId: string) =>
      result<any>(apiClient.get(`/chats/message/${encodeURIComponent(messageId)}`)),
    findPageMessage: (messageId: string) =>
      result<any>(apiClient.get(`/chats/message/${encodeURIComponent(messageId)}/page`)),
    markMessageRead: (messageId: string) =>
      result(apiClient.put(`/chats/message/${encodeURIComponent(messageId)}/read`)),
    markChatRead: (chatId: string) =>
      result(apiClient.patch(`/chats/${encodeURIComponent(chatId)}/read`)),
    archive: (chatId: string) =>
      result(apiClient.put(`/chats/${encodeURIComponent(chatId)}/archive`)),
    unarchive: (chatId: string) =>
      result(apiClient.put(`/chats/${encodeURIComponent(chatId)}/unarchive`)),
  };
}
export const chatService = new ChatService();
