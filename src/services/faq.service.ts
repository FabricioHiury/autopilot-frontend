import { AxiosError } from 'axios';
import { apiClient, type ApiResult } from './api.client';
export class FaqService {
  faq = {
    list: this.listFaq,
    get: this.getFaq,
    registerView: this.registerFaqView,
  };
  async listFaq(params: {
    page: number;
    limit: number;
    search?: string;
    tags?: string[];
  }): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.get('faq', {
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search,
          tags: params.tags?.join(','),
        },
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
  async getFaq(id: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.get(`faq/${id}`);
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
  async registerFaqView(id: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.post(`/faq/views/${id}`);
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
export const faqService = new FaqService();
