export interface TemporaryCustomerDetails {
  id: string;
  avatar: string | null;
  name: string | null;
  email: string | null;
  whatsapp: string | null;
  channel: string;
  externalContactId: string;
  createdAt: string;
  updatedAt: string;
}
export interface ChatListItem {
  id: string;
  storeId: string;
  customerId: string | null;
  temporaryCustomerId: string | null;
  dealId: string | null;
  externalRecipientId: string;
  channel: string;
  createdAt: string;
  updatedAt: string;
  customer: any; // ou defina um tipo específico, caso seja necessário
  temporaryCustomer?: TemporaryCustomerDetails;
  externalAdId: string | null;
  message?: {
    content: string;
    createdAt: string;
  }[];
}
export interface Pessoa {
  name: string;
  avatar: string | null;
}
export interface MessageType {
  id: string;
  userId: string | null;
  chatId: string;
  externalRecipientId: string;
  externalMessageId: string | null;
  attachmentUrl: string | null;
  attachmentType: string | null;
  quotedMessageId?: string | null;
  sender: string;
  content: string;
  channel: string;
  createdAt: string;
  person: Pessoa;
}
