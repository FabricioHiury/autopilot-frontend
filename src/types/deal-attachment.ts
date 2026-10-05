export interface DealAttachment {
  attachmentId: string;
  url: string;
  name: string;
  type: string;
  data: string;
  nameOriginal?: string;
}
export interface DealAttachmentList {
  attachments: DealAttachment[];
  page: number;
  itemsPerPage: number;
  totalPages: number;
}
export interface ChatAttachment {
  id: string;
  chatId: string;
  attachmentUrl: string;
  attachmentType: string;
  channel: string;
  createdAt: Date;
}
