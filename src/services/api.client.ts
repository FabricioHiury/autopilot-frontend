import { userMessage } from '@/lib/user-messages';
import axios, { AxiosError } from 'axios';
import { clearSession, getAccessToken } from './session';
export interface ApiEnvelope<T> {
  message: string;
  statusCode: number;
  data: T;
}
export type ApiResult<T> = [
  T | null,
  {
    message: string;
    statusCode?: number;
  } | null,
];
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
export const apiClient = axios.create({ baseURL: API_URL, timeout: 30000 });
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/backoffice/app') &&
    /^\/?support(?:\/|$)/.test(config.url || '')
  ) {
    config.url = '/backoffice/' + config.url!.replace(/^\//, '');
  }
  if (token && !/^\/?auth\/(login|forgot-password|reset-password)/.test(config.url || '')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      error.config?.headers?.Authorization &&
      typeof window !== 'undefined'
    ) {
      clearSession();
      window.location.assign('/auth/login');
    }
    if (error.response?.data?.message) {
      error.response.data.message = userMessage(error.response.data.message, error.response.status);
    }
    error.message = userMessage(
      error.response?.data?.message || error.message,
      error.response?.status,
    );
    return Promise.reject(error);
  },
);
export function apiError(error: unknown): {
  message: string;
  statusCode?: number;
} {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    return {
      message: userMessage(message || error.message, error.response?.status),
      statusCode: error.response?.status,
    };
  }
  return {
    message: userMessage(error instanceof Error ? error.message : null),
  };
}
export async function requestData<T>(
  operation: Promise<{
    data: ApiEnvelope<T>;
  }>,
): Promise<T> {
  try {
    return (await operation).data.data;
  } catch (error) {
    throw new Error(apiError(error).message);
  }
}
