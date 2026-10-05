export type UserType = {
  id?: string;
  name: string;
  icon: string | null;
};
export type CustomerType = {
  id: string;
  storeId: string;
  photoUrl: string | null;
  name: string;
  typePerson: 'legalEntity' | 'individual';
  taxId: string;
  identityNumber: string;
  foreigner: boolean;
  gender: 'masculino' | 'feminino' | 'outro';
  status: 'active' | 'inactive';
  birthDate: string; // ISO 8601 format
  notes: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  version: number;
  createdAt: string; // ISO 8601 format
  avatarUrl: string;
  updatedAt: string; // ISO 8601 format
  customerAddress: {
    id: string;
    customerId: string;
    postalCode: string;
    state: string;
    city: string;
    address: string;
    district: string;
    number: string;
    complement: string | null;
    createdAt: string; // ISO 8601 format
    updatedAt: string; // ISO 8601 format
  };
  totalDeals: number;
};
export type optionType = {
  name: string;
  value: string;
};
export interface PopWrapperRef {
  show: () => void;
  drop: () => void;
}
export interface ActionsRef {
  show: () => void;
}
export type Admin = {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'inactive';
  profile: string;
  createdAt: string;
  avatarUrl: string;
  permissions: string[];
};
