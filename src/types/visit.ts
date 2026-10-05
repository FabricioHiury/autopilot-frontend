import { DealDetails } from '@/types/deal';
export interface DealVisit {
  id: string;
  dealId: string;
  notes: string | null;
  type: string;
  data: string;
  hourStart: string;
  hourEnd: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  deal: DealDetails;
}
