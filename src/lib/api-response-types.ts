export type { AuthSession } from '@/types/auth';

export interface Employee {
  id: string;
  storeId: string;
  userId: string;
  photoUrl: string;
  name: string;
  taxId: string;
  status: string;
  notes: string;
  phoneAdditional: string;
  whatsapp: string;
  email: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

type Role = {
  role: string;
  features: string;
  id: string;
  storeId: string;
};

export type { DealComment as DealComment, DealCommentList } from '@/types/comment';
