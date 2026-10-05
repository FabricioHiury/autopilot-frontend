import { AxiosError } from 'axios';
import { apiClient, type ApiResult } from './api.client';
export class DistributionService {
  distributionAutomatic = {
    getConfiguration: this.getConfigurationDistribution,
    configure: this.configureDistributionAutomatic,
  };
  async getConfigurationDistribution(): Promise<
    ApiResult<{
      distributionAutomatic: boolean;
      employees: {
        id: string;
        name: string;
        ativo: boolean;
      }[];
    }>
  > {
    try {
      const { data: response } = await apiClient.get('/store/distribution-automatic/configuration');
      return [response.data, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para acessar as configurações' }];
      }
      return [null, { message: 'Erro ao carregar configurações de distribuição' }];
    }
  }
  async configureDistributionAutomatic(data: {
    distributionAutomatic: boolean;
  }): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.put(
        '/store/distribution-automatic/configuration',
        data,
      );
      return [response.data, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para alterar as configurações' }];
      }
      return [null, { message: 'Erro ao salvar configurações de distribuição' }];
    }
  }
}
export const distributionService = new DistributionService();
