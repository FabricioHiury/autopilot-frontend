export interface CustomerHistory {
  search: string;
  customerId: string;
  temporaryCustomerId: string | null;
  page: number;
  itemsPage: number;
  totalItems: number;
  totalPages: number;
  deals: Deal[];
}
interface Deal {
  id: string;
  title: string;
  descriptionDeal: string;
  status: 'ABERTO' | string;
  dealMode: 'ONLINE' | string;
  dealOrigin: 'CHAT' | string;
  temperature: 'QUENTE' | string;
  createdAt: string;
  updatedAt: string | null;
  customer: Customer;
  assignees: Assignee[];
  tags: Tag[];
  counters: Counters;
}
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  avatarUrl: string;
  type: string;
}
interface Assignee {
  id: string;
  name: string;
  avatarUrl: string;
}
interface Tag {
  id: string;
  name: string;
  color: string;
}
interface Counters {
  comments: number;
  attachments: number;
}
