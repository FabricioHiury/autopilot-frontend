import { DealStatus } from '@/types/deal-status';
export interface PipelineColumn {
  id: string;
  stage: DealStatus;
  stageLabel: string;
  color: string;
  items: PipelineDeal[];
}
export interface PipelineDeal {
  id: string;
  data: {
    stage: DealStatus;
    status: DealStatus;
    channels: Array<'whatsapp' | 'instagram' | 'facebook' | 'olx' | 'other'>;
    dealOrigin?: string;
    temperature?: 'HOT' | 'WARM' | 'COLD';
    name: string;
    title?: string;
    avatar?: string;
    email?: string;
    phone?: string;
    assignee?: string;
    assignees: {
      id: string;
      name: string;
      whatsapp?: string | null;
      userId: string;
    }[];
    assigneeAvatar?: string;
    commentCount?: number;
    attachmentCount?: number;
    totalTasks?: number;
    comments?: number;
    // Adiciona tags retornadas pelo backend
    tags?: {
      id: string;
      name: string;
      description?: string;
      color?: string;
    }[];
    // Adiciona lista de chats para renderização de ícones/ações
    chats?: {
      id: string;
      channel: string;
    }[];
  };
}
export interface DealListResponse {
  search: string;
  dealMode: string;
  origin: string;
  employeeIds: string[];
  page: number;
  itemsPage: number;
  dataStart: string;
  dataEnd: string;
  deals: DealListItem[];
}
export interface DealListItem {
  id: string;
  title: string;
  descriptionDeal: string;
  dealOrigin: string;
  temperature: string;
  dealMode: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  customer: DealCustomer | null;
  assignees: DealAssignee[];
  tasks: number;
  comments: number;
  chats: {
    id: string;
    channel: string;
  }[];
  tags: {
    id: string;
    name: string;
    description: string;
    color: string;
  }[];
}
export interface DealDetails {
  id: string;
  customer?: {
    id: string;
    whatsapp: string;
    email: string;
    avatarUrl: string;
    name: string;
  };
  temporaryCustomer?: {
    id?: string;
    name: string;
    email: string;
    whatsapp: string;
    avatar?: string;
  };
  customerId?: string;
  createdAt: string;
  updatedAt: string;
  descriptionDeal: string;
  note: string;
  dealMode: 'BUY' | 'SELL' | 'CONSIGNMENT';
  dealOrigin: 'whatsapp' | 'instagram' | 'facebook' | 'olx' | 'other';
  status: DealStatus;
  temperature: 'HOT' | 'WARM' | 'COLD';
  title: string;
  assignees: {
    employeeId: string;
    name: string;
    avatarUrl?: string;
    roles: string;
    userId: string;
  }[];
  comments: any[];
  chats: {
    id: string;
    channel: string;
  }[];
}
interface DealCustomer {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}
interface DealAssignee {
  id: string;
  name: string;
  whatsapp?: string;
  userId: string;
}
export type Deal = DealDetails;
