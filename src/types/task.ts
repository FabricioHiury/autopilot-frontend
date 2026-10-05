export interface DealTask {
  id: string;
  dealId: string;
  name: string;
  notes: string | null;
  assigneeId: string | null;
  data: string;
  hourStart: string | null;
  hourEnd: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
