import { AxiosError } from 'axios';
import { CustomerType } from '@/types/customer';
import { apiClient, type ApiResult } from './api.client';
export class CustomerService {
  customer = {
    list: this.listCustomers,
    register: this.registerCustomer,
  };
  async registerCustomer(customer: {
    name: string;
    typePerson: 'individual' | 'legalEntity';
    taxId: string;
    identityNumber?: string;
    foreigner: boolean;
    gender?: 'masculino' | 'feminino' | 'outro';
    birthDate: string;
    phone?: string;
    whatsapp: string;
    email?: string;
    notes?: string;
    postalCode: string;
    state: string;
    city: string;
    address: string;
    district: string;
    number: string;
    complement?: string;
  }): Promise<ApiResult<CustomerType>> {
    try {
      const { data: response } = await apiClient.post('/customers/create', customer);
      return [response.data as CustomerType, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para cadastrar clientes' }];
      }
      if (error instanceof AxiosError && error.response?.status === 409) {
        return [null, { message: 'Cliente já cadastrado com este documento ou whatsapp' }];
      }
      if (error instanceof AxiosError && error.response?.status === 400) {
        return [null, { message: 'Dados inválidos para cadastro de cliente' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível cadastrar o cliente' }];
    }
  }
  async listCustomers(
    params?:
      | string
      | {
          search?: string;
          page?: number;
          limit?: number;
          dataStart?: string;
          dataEnd?: string;
          gender?: string;
          state?: string;
          channelOrigin?: string;
          termo?: string;
        },
  ): Promise<
    ApiResult<{
      page: number;
      limit: number;
      totalPages: number;
      totalCustomers: number;
      customers: CustomerType[];
    }>
  > {
    try {
      let url = '/customers/list';
      let queryParams = {};
      if (typeof params === 'string') {
        url += params;
      } else if (params) {
        const page = params.page || 1;
        const limit = params.limit || 100;
        queryParams = {
          page,
          limit,
          ...(params.search && { search: params.search }),
          ...(params.termo && { termo: params.termo }),
          ...(params.dataStart && { dataStart: params.dataStart }),
          ...(params.dataEnd && { dataEnd: params.dataEnd }),
          ...(params.gender && { gender: params.gender }),
          ...(params.state && { state: params.state }),
          ...(params.state && { state: params.state }),
          ...(params.channelOrigin && { channelOrigin: params.channelOrigin }),
        };
      }
      const { data: response } = await apiClient.get(url, {
        params: typeof params === 'string' ? {} : queryParams,
      });
      return [
        response.data as {
          page: number;
          limit: number;
          totalPages: number;
          totalCustomers: number;
          customers: CustomerType[];
        },
        null,
      ];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para listar os clientes' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível listar os clientes' }];
    }
  }
}
export const customerService = new CustomerService();
