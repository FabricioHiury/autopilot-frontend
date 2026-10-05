import { AxiosError } from 'axios';
import { TicketList } from '@/types/support';
import { apiClient, type ApiResult } from './api.client';
export class SupportService {
  support = {
    list: this.listSupport,
    get: this.getSupport,
    create: this.createSupport,
    reply: this.replySupport,
    updateStatus: this.updateStatusSupport,
    listStatus: this.listStatusSupport,
    listCategories: this.listCategoriesSupport,
    sendAttachmentTicket: this.sendAttachmentTicket,
    listPriorities: this.listPrioritiesSupport,
    getAttachments: this.getAttachmentsTicket,
  };
  async listSupport(params: {
    search?: string;
    priority?: 'normal' | 'urgent';
    status?: 'open' | 'at resolution' | 'closed';
    category?: string;
    dataStart?: Date;
    dataEnd?: Date;
    page?: number;
    itemsPage?: number;
  }): Promise<ApiResult<TicketList>> {
    try {
      const { data: response } = await apiClient.get('support', { params });
      return [response.data as TicketList, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível realizar a requisição' }];
    }
  }
  async sendAttachmentTicket(id: string, formData: FormData): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.postForm(`/support/${id}/attachments`, formData);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível realizar a requisição' }];
    }
  }
  async updateStatusSupport(id: string, status: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.put(`backoffice/support/${id}/update-status`, {
        status,
      });
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível realizar a requisição' }];
    }
  }
  async getSupport(id: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.get(`support/${id}`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível realizar a requisição' }];
    }
  }
  async getAttachmentsTicket(ticketId: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.get(`support/${ticketId}/attachments`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível realizar a requisição' }];
    }
  }
  async createSupport(body: {
    title: string;
    category: string;
    subject: string;
    message: string;
  }): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.post('support', body);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível realizar a requisição' }];
    }
  }
  async replySupport(
    id: string,
    body: {
      reply: string;
    },
  ): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.post(`support/${id}/reply`, body);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível realizar a requisição' }];
    }
  }
  async listStatusSupport(): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.get('support/status');
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível realizar a requisição' }];
    }
  }
  async listCategoriesSupport(): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.get('support/categories');
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível realizar a requisição' }];
    }
  }
  async listPrioritiesSupport(): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.get('support/priorities');
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível realizar a requisição' }];
    }
  }
}
export const supportService = new SupportService();
