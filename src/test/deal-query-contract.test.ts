import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/services/api.client';
import { DealService } from '@/services/deal.service';
afterEach(() => vi.restoreAllMocks());
describe('deal query contracts', () => {
  it('uses itemsByPage to list attachments', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({data:{data:{attachments:[],totalPages:0}}});
    await new DealService().deal.listAttachments({dealId:'deal',limit:4,page:1});
    expect(get).toHaveBeenCalledWith('/deals/deal/attachments?itemsByPage=4&page=1');
  });
  it('maps suspension filters to English DTO keys', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({data:{data:{}}});
    await new DealService().deal.listSuspensions({startDateInicio:'2026-10-01',startDateFim:'2026-10-06',ativas:true});
    expect(get.mock.calls[0][1]?.params).toMatchObject({startDateStart:'2026-10-01',startDateEnd:'2026-10-06',active:true});
    expect(get.mock.calls[0][1]?.params).not.toHaveProperty('ativas');
  });
});
