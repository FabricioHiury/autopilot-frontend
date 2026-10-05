import { apiClient, requestData } from './api.client';
import type { TenantConfig, UpdateTenantConfig } from '@/types/store';
export const tenantService = {
  getCustomization: () => requestData<TenantConfig>(apiClient.get('/store/customization')),
  updateCustomization: (input: UpdateTenantConfig) =>
    requestData<TenantConfig>(apiClient.put('/store/customization', input)),
  uploadLogo: (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return requestData<{
      url: string;
    }>(apiClient.post('/store/update-logo', body));
  },
};
