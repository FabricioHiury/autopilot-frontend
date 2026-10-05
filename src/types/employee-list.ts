export interface EmployeeList {
  search: string;
  page: number;
  limit: number;
  totalPages: number;
  totalEmployees: number;
  employees: Array<{
    id: string;
    storeId: string;
    roles: Array<{
      id: string;
      storeId: string;
      role: string;
      features: string;
    }>;
    userId: string;
    name: string;
    taxId: string;
    whatsapp: string;
    phoneAdditional: string;
    status: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
    email: string;
  }>;
}
