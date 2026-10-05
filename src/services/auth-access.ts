import { apiClient, requestData } from './api.client';
export interface AccessData<P extends string> {
  roles: string[];
  permissions: P[];
  fetchedAt: Date;
}
export async function fetchAccess<P extends string>(admin: boolean): Promise<AccessData<P>> {
  const data = await requestData<{
    role?: string[];
    permission?: P[];
    queryAt?: string;
  }>(apiClient.get(admin ? '/backoffice/auth/access' : '/store/meu-access'));
  return {
    roles: data.role || [],
    permissions: data.permission || [],
    fetchedAt: new Date(data.queryAt || Date.now()),
  };
}
