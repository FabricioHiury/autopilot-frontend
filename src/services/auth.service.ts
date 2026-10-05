import { AxiosError } from 'axios';
import { AuthSession } from '@/lib/api-response-types';
import { StorePermission } from '@/types/permissions';
import { apiClient, apiError, type ApiResult } from './api.client';
export class AuthService {
  auth = {
    login: this.login,
    forgotPassword: this.forgotPassword,
    resetPassword: this.resetPassword,
    access: this.getAccess,
  };
  async login(email: string, password: string): Promise<ApiResult<AuthSession>> {
    try {
      const { data: response } = await apiClient.post('/auth/login', {
        email,
        password,
      });
      return [response.data as AuthSession, null];
    } catch (error) {
      return [null, apiError(error)];
    }
  }
  async forgotPassword(email: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.post(
        `/auth/forgot-password/${encodeURIComponent(email)}`,
      );
      return [response.data, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Email inválido.' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao recuperar a senha.' }];
    }
  }
  async resetPassword(token: string, password: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.post(`/auth/reset-password`, { password, token });
      return [response.data, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Token inválido.' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao redefinir a senha.' }];
    }
  }
  async getAccess(): Promise<
    ApiResult<{
      role: string[];
      permission: StorePermission[];
      queriedAt: Date;
    }>
  > {
    try {
      const { data: response } = await apiClient.get('/store/meu-access');
      if (!response.data) {
        return [null, { message: 'Erro ao pegar o acesso.' }];
      }
      return [
        {
          role: response.data.role,
          permission: response.data.permission,
          queriedAt: new Date(response.data.queryAt),
        },
        null,
      ];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para acessar essa funcionalidade' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao pegar o acesso.' }];
    }
  }
}
export const authService = new AuthService();
