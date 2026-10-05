import { apiClient, apiError } from '@/services/api.client';
import { Query } from './query';
class Api {
  readonly query = new Query();
  private async request<T = any>(
    method: string,
    url: string,
    data?: unknown,
    config?: Record<string, unknown>,
  ): Promise<[T | null, any]> {
    try {
      const response = await apiClient.request<T>({ method, url, data, ...config });
      return [response.data, null];
    } catch (error) {
      return [null, apiError(error)];
    }
  }
  get<T = any>(url: string, config?: Record<string, unknown>) {
    return this.request<T>('GET', url, undefined, config);
  }
  post<T = any>(url: string, data?: unknown) {
    return this.request<T>('POST', url, data);
  }
  put<T = any>(url: string, data?: unknown) {
    return this.request<T>('PUT', url, data);
  }
  delete<T = any>(url: string, data?: unknown) {
    return this.request<T>('DELETE', url, data);
  }
  formData<T = any>(url: string, data: Record<string, any> | FormData, method = 'PUT') {
    const form = data instanceof FormData ? data : new FormData();
    if (!(data instanceof FormData))
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) form.append(key, value);
      }
    return this.request<T>(method, url, form);
  }
  uploadFile<T = any>(url: string, form: FormData, method = 'POST') {
    return this.request<T>(method, url, form);
  }
}
const api = new Api();
export default api;
export const apiAdmin = new Api();
