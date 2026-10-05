import { apiClient, requestData } from './api.client';
import type { CopilotAnalysis } from '@/types/copilot';
export const copilotService = {
  getAnalysis: (chatId: string) =>
    requestData<CopilotAnalysis>(apiClient.get(`/chats/${encodeURIComponent(chatId)}/copilot`)),
  refreshAnalysis: (chatId: string) =>
    requestData<{
      queued: boolean;
    }>(apiClient.post(`/chats/${encodeURIComponent(chatId)}/copilot/refresh`)),
  applyToDeal: (dealId: string, descriptionDeal: string, temperature?: 'HOT' | 'WARM' | 'COLD') =>
    requestData(
      apiClient.patch(`/deals/${encodeURIComponent(dealId)}/status`, {
        descriptionDeal,
        ...(temperature ? { temperature } : {}),
      }),
    ),
  getDeal: (dealId: string) =>
    requestData<{
      descriptionDeal?: string | null;
      temperature?: string;
    }>(apiClient.get(`/deals/${encodeURIComponent(dealId)}`)),
};
