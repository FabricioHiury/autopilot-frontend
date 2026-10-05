import { apiClient, requestData } from './api.client';
export interface TenantListItem {
  id: string;
  companyName: string;
  taxId: string;
  email: string;
  wppConfigured: boolean;
  createdAt: string;
  avatarUrl?: string;
}
export interface TenantList {
  stores: TenantListItem[];
  page: number;
  itemsByPage: number;
  totalPages: number;
}
export interface RegisterTenantInput {
  name: string;
  assignee: string;
  taxId: string;
  email: string;
  password: string;
  state: string;
  city: string;
}
export const backofficeService = {
  listStores: (params: { page?: number; search?: string; itemsByPage?: number }) =>
    requestData<TenantList>(apiClient.get('/backoffice/stores', { params })),
  registerStore: (body: RegisterTenantInput) =>
    requestData(apiClient.post('/store/register', body)),
  configureWhatsapp: (storeId: string) =>
    requestData(apiClient.post('/backoffice/stores/configure-wpp', { storeId })),
};
