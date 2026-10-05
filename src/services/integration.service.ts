import { AxiosError } from 'axios';
import { apiClient, type ApiResult } from './api.client';
export class IntegrationService {
  integrations = {
    list: this.listIntegrations,
  };
  async listIntegrations(): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.get('/integrations/status');
      return [response.data, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para listar as integrações' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao listar as integrações.' }];
    }
  }
}
export const integrationService = new IntegrationService();
