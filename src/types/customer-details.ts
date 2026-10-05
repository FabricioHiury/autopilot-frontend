export type Customer = {
  id: string;
  storeId: string;
  photoUrl: string | null;
  name: string;
  avatarUrl?: string;
  typePerson: 'individual' | 'legalEntity';
  taxId: string;
  identityNumber: string;
  foreigner: boolean;
  gender: string;
  status: 'active' | 'inactive';
  birthDate: string; // ISO 8601 date string
  notes: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  version: number;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  customerAddress: {
    id: string;
    customerId: string;
    postalCode: string;
    state: string; // e.g., "sp", "rj", "al"
    city: string;
    address: string;
    district: string;
    number: string;
    complement: string | null;
    createdAt: string; // ISO 8601 date string
    updatedAt: string; // ISO 8601 date string
  };
  deals: Deal[]; // Adjust type if atendimentos has a specific structure
  totalDeals: number;
  userCreator: {
    id: string;
    name: string;
    profile: string;
  };
};
export type Deal = {
  dealTask: any[]; // Substitua `any[]` por um tipo específico se necessário
  createdAt: string; // ISO string para data
  descriptionDeal: string;
  id: string;
  attachments: any[]; // Substitua `any[]` por um tipo específico se necessário
  note: string;
  status: string;
  title: string;
  temperature: string;
  dealOrigin: string;
  dealMode: string;
  dealActivityLogs: {
    message: string;
    id: string;
    createdAt: string; // ISO string para data
  }[];
  dealComment: any[]; // Substitua `any[]` por um tipo específico se necessário
  dealAssignee: {
    employee: {
      name: string;
      userId: string;
    };
  }[];
  chat: any[]; // Substitua `any[]` por um tipo específico se necessário
  selecionado: boolean;
  dealVisit: {
    completed: boolean;
    createdAt: string;
    data: string;
    hourEnd: string;
    hourStart: string;
    id: string;
    notes: string;
    type: string;
  }[];
};
type DealActivityLog = {
  id: string;
  dealId: string;
  message: string;
  createdAt: string; // ISO date string
};
