'use client';

import { DealStatus, DealStatusLabel } from '@/types/deal-status';

export const dealStatusNames = {
  [DealStatus.DEAL_INITIAL]: DealStatusLabel.DEAL_INITIAL,
  [DealStatus.AT_NEGOTIATION]: DealStatusLabel.AT_NEGOTIATION,
  [DealStatus.LOST]: DealStatusLabel.LOST,
  [DealStatus.PRE_DEAL]: DealStatusLabel.PRE_DEAL,
  [DealStatus.RECOVERY]: DealStatusLabel.RECOVERY,
  [DealStatus.SUCCESS]: DealStatusLabel.SUCCESS,
  [DealStatus.VISIT]: DealStatusLabel.VISIT,
  [DealStatus.CHAT]: DealStatusLabel.CHAT,
};
