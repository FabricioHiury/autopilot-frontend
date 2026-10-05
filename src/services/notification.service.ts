import { AxiosError } from 'axios';
import { Notification, NotificationStatus } from '@/types/notification';
import { apiClient, type ApiResult } from './api.client';
export class NotificationService {
  notifications = {
    list: this.listNotifications,
    markRead: this.markNotificationRead,
    markAllRead: this.markAllNotificationsRead,
  };
  async listNotifications(status?: NotificationStatus): Promise<
    ApiResult<{
      total: number;
      totalViewed: number;
      totalPending: number;
      notifications: Notification[];
    }>
  > {
    try {
      const query = status ? `?status=${status}` : '';
      const { data: response } = await apiClient.get(`/notifications/list${query}`);
      return [
        response.data as {
          total: number;
          totalViewed: number;
          totalPending: number;
          notifications: Notification[];
        },
        null,
      ];
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
  async markNotificationRead(id: string, status: NotificationStatus): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.put(`/notifications/update-status/${id}`, {
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
  async markAllNotificationsRead(): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.put(`/notifications/all-viewed`);
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
export const notificationService = new NotificationService();
