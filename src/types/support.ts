export interface TicketList {
  total: number;
  page: number;
  totalPages: number;
  tickets: TicketListItem[];
}
export interface TicketListItem {
  id: string;
  userId: string;
  storeId: string;
  title: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  type: string | null;
  category: string;
  history: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
  };
}
export interface TicketHistoryEvent {
  event: string;
  action: string;
  user: {
    id: string;
    name: string;
  };
  data: string;
}
export type Ticket = {
  id: string;
  userId: string;
  storeId: string;
  title: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  type: null;
  category: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
  replies: {
    id: string;
    ticketId: string;
    userId: string;
    reply: string;
    createdAt: string;
    updatedAt: string;
    files: any[];
    user: {
      id: string;
      name: string;
    };
  }[];
  files: {
    id: string;
    createdAt: string;
    updatedAt: string;
    idReply: null;
    ticketId: string;
    fileId: string;
    url: string;
  }[];
  history: {
    id: string;
    event: string;
    action: string;
    ticketId: string;
    userId: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
    };
  }[];
  store: {
    id: string;
    storeOwnerId: string;
    photoUrl: null;
    taxId: string;
    companyName: string;
    registrationMunicipal: null;
    registrationState: null;
    regimeTax: null;
    portalCompany: null;
    activityPrimary: null;
    descriptionActivity: null;
    wppConfigured: boolean;
    wppInstance: null;
    createdAt: string;
    updatedAt: string;
    storeOwner: {
      id: string;
      userId: string;
      status: string;
      tokenCustomerMeta: null;
      tokenCustomerOlx: null;
      deviceToken: null;
      createdAt: string;
      updatedAt: string;
      user: {
        id: string;
        email: string;
      };
    };
  };
};
