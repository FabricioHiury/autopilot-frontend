import { Role } from '@/types/role';
export interface Employee {
  email: any;
  id: string;
  storeId: string;
  userId: string;
  photoUrl: string | null;
  name: string;
  taxId: string;
  whatsapp: string;
  phoneAdditional: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  roles?: Role[];
  features?: string[];
}
export interface CreateEmployeeInput {
  email: string;
  password?: string;
  name: string;
  photoUrl?: string;
  taxId: string;
  whatsapp: string;
  phoneAdditional?: string;
  notes: string;
  roles: string[];
  features: string[];
}
