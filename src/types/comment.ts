export interface DealComment {
  id: string;
  dealId: string;
  userId: string;
  name: string;
  avatar: string;
  createdAt: Date;
  comment: string;
}
export interface DealCommentList {
  page: number;
  itemsPage: number;
  comments: DealComment[];
}
