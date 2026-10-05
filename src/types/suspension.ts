export interface Suspension {
  id: string;
  userId: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: {
      file?: {
        url?: string;
      };
    };
  };
}
export interface SuspensionFilter {
  userId?: string;
  description?: string;
  startDateInicio?: string;
  startDateFim?: string;
  ativas?: boolean;
  page?: number;
  itemsPage?: number;
}
export interface SuspensionList {
  data: Suspension[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
