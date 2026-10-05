import { Employee, CreateEmployeeInput } from '@/types/employee';
import { AxiosError } from 'axios';
import { apiClient, type ApiResult } from './api.client';
export class EmployeeService {
  employee = {
    create: this.createEmployee,
    list: this.listEmployees,
    get: this.getEmployee,
    update: this.updateEmployee,
  };
  async createEmployee(employee: CreateEmployeeInput): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.post('/employees/create-employee', employee);
      return [response.data as any, null];
    } catch (error) {
      const errorAxios = error as AxiosError<{
        message: string;
      }>;
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para criar colaboradores' }];
      }
      if (error instanceof AxiosError && error.response?.status === 409) {
        return [null, { message: 'E-mail já cadastrado, utilize outro e-mail' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      if (errorAxios.response?.data.message.includes('email')) {
        return [null, { message: 'Email já cadastrado no banco' }];
      }
      return [null, { message: 'Erro ao criar o colaborador' }];
    }
  }
  async updateEmployee(employeeId: string, employee: CreateEmployeeInput): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.put(
        `/employees/edit-employee/${employeeId}`,
        employee,
      );
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para atualizar colaboradores' }];
      }
      if (error instanceof AxiosError && error.response?.status === 409) {
        return [null, { message: 'E-mail já cadastrado, utilize outro e-mail' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao atualizar o colaborador.' }];
    }
  }
  async listEmployees(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<
    ApiResult<{
      page: number;
      limit: number;
      totalPages: number;
      totalEmployees: number;
      employees: Employee[];
    }>
  > {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const search = params.search || '';
    const role = params.role || '';
    try {
      const { data: response } = await apiClient.get('/employees/search-employees', {
        params: { page, limit, search, role },
      });
      return [
        response.data as {
          page: number;
          limit: number;
          totalPages: number;
          totalEmployees: number;
          employees: Employee[];
        },
        null,
      ];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para listar os colaboradores' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível listar os colaboradores' }];
    }
  }
  async getEmployee(employeeId: string): Promise<ApiResult<Employee>> {
    try {
      const { data: response } = await apiClient.get(`/employees/search-employee/${employeeId}`);
      return [response.data as Employee, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para pegar os colaboradores' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível pegar o colaborador' }];
    }
  }
}
export const employeeService = new EmployeeService();
