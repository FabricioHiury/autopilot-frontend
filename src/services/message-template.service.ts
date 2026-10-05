import { AxiosError } from 'axios';
import { apiClient, type ApiResult } from './api.client';
import type { MessageTemplate } from '@/types/message-template';
export class MessageTemplateService {
  messageTemplates = {
    list: this.listMessagesTemplates,
    create: this.createMessageTemplate,
    update: this.updateMessageTemplate,
    remove: this.removeMessageTemplate,
  };
  async listMessagesTemplates(): Promise<ApiResult<MessageTemplate[]>> {
    try {
      const { data: response } = await apiClient.get(`/messages-templates`);
      const raw = response?.data ?? response;
      const messages: MessageTemplate[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.messages)
          ? raw.messages
          : [];
      return [messages, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão' }];
      }
      return [null, { message: 'Erro ao listar mensagens automáticas' }];
    }
  }
  async createMessageTemplate(payload: {
    title: string;
    content: string;
  }): Promise<ApiResult<MessageTemplate>> {
    try {
      const { data: response } = await apiClient.post(`/messages-templates`, payload);
      return [response.data as MessageTemplate, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão' }];
      }
      return [null, { message: 'Erro ao criar mensagem automática' }];
    }
  }
  async updateMessageTemplate(
    id: string,
    payload: {
      title: string;
      content: string;
    },
  ): Promise<ApiResult<MessageTemplate>> {
    try {
      const { data: response } = await apiClient.patch(`/messages-templates/${id}`, payload);
      return [response.data as MessageTemplate, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: 'Mensagem não encontrada' }];
      }
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão' }];
      }
      return [null, { message: 'Erro ao atualizar mensagem automática' }];
    }
  }
  async removeMessageTemplate(id: string): Promise<ApiResult<void>> {
    try {
      await apiClient.delete(`/messages-templates/${id}`);
      return [undefined, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: 'Mensagem não encontrada' }];
      }
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão' }];
      }
      return [null, { message: 'Erro ao remover mensagem automática' }];
    }
  }
}
export const messageTemplateService = new MessageTemplateService();
