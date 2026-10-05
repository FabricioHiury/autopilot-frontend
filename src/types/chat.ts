import { TemporaryCustomer } from '@/types/temporary-customer';
import { Message } from '@/types/message';
export type Chat = {
  id: string;
  storeId: string;
  customerId: string | null;
  temporaryCustomerId: string;
  dealId: string | null;
  externalRecipientId: string;
  externalAdId: string | null;
  lastMessageCustomerAt: string | null;
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'olx' | 'other';
  createdAt: string;
  updatedAt: string;
  customer: any;
  temporaryCustomer: TemporaryCustomer;
  message: Message[];
  deal?: {
    id: string;
    status: string;
    dealAssignee: {
      id: string;
      employee: {
        userId: string;
        name: string;
      };
    }[];
  };
};
