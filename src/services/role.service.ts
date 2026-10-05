import { AxiosError } from 'axios';
import { RoleDetails } from '@/types/role';
import { apiClient, type ApiResult } from './api.client';
export class RoleService {
  role = {
    save: this.saveRole,
    list: this.listRoles,
    delete: this.deleteRole,
  };
  async saveRole(role: string, features: string[], id?: string): Promise<ApiResult<RoleDetails>> {
    try {
      const { data: response } = await apiClient.put('/store/role', {
        role,
        features,
        id,
      });
      return [response.data as RoleDetails, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para criar cargos' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao criar o cargo.' }];
    }
  }
  async listRoles(): Promise<ApiResult<RoleDetails[]>> {
    try {
      const { data: response } = await apiClient.get('/store/role');
      return [response.data.roles as RoleDetails[], null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para listar os cargos' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao listar os cargos.' }];
    }
  }
  async deleteRole(id: string): Promise<ApiResult<void>> {
    try {
      await apiClient.delete(`/store/role`, { data: { id } });
      return [undefined, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para deletar cargos' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao deletar o cargo.' }];
    }
  }
}
export const roleService = new RoleService();
