export type Message = {
  id: string;
  userId: string | null;
  chatId: string;
  externalRecipientId: string;
  externalMessageId: string;
  attachmentUrl: string | null;
  attachmentType: string | null;
  type?: string | null;
  quotedMessageId?: string | null;
  originalMessage?: {
    id: string;
    content: string | null;
    attachmentUrl: string | null;
    attachmentType: string | null;
    createdAt: string;
    person: any | null;
  } | null;
  sender: 'CUSTOMER' | 'STORE' | 'SYSTEM' | string;
  content: string;
  channel: string;
  createdAt: string;
  person: any | null;
  isRead: boolean;
  deliveryStatus?: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
};
