import { AxiosError } from 'axios';
import { getStoreStorageId } from '@/lib/user.utils';
import { GeneralReport } from '@/types/general-report';
import { ChannelReport } from '@/types/channel-report';
import { SalespersonDetailReport } from '@/types/salesperson-detail-report';
import { SalespersonReport } from '@/types/salesperson-report';
import { EmployeeList } from '@/types/employee-list';
import { apiClient } from './api.client';
export class ReportsService {
  reports = {
    listGeneral: this.listReportGeneral,
    listDealChannel: this.listReportDealChannel,
    listBySalesperson: this.listReportSalespersonDetailed,
    listReportSalesperson: this.listReportSalesperson,
    findEmployee: this.findEmployee,
  };
  async listReportGeneral(
    dataStart: string,
    dataEnd: string,
    salespersonId?: string,
  ): Promise<GeneralReport | null> {
    try {
      const params = new URLSearchParams({
        dataStart,
        dataEnd,
      });
      if (salespersonId) {
        params.append('employeeId', salespersonId);
      }
      const { data: response } = await apiClient.get(
        `/store/${getStoreStorageId()}/reports/deals/general?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return null;
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return null;
      }
      return null;
    }
  }
  async listReportDealChannel(
    dataStart: string,
    dataEnd: string,
    salespersonId?: string,
  ): Promise<ChannelReport | null> {
    try {
      const params = new URLSearchParams({
        dataStart,
        dataEnd,
      });
      if (salespersonId) {
        params.append('employeeId', salespersonId);
      }
      const { data: response } = await apiClient.get(
        `/store/${getStoreStorageId()}/reports/deals/channel?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return null;
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return null;
      }
      return null;
    }
  }
  async listReportSalespersonDetailed(
    dataStart: string,
    dataEnd: string,
    salespersonId?: string,
  ): Promise<SalespersonDetailReport | null> {
    try {
      const params = new URLSearchParams({
        dataStart,
        dataEnd,
      });
      if (salespersonId) {
        params.append('employeeId', salespersonId);
      }
      const { data: response } = await apiClient.get(
        `/store/${getStoreStorageId()}/reports/deals/salesperson/detailed?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return null;
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return null;
      }
      return null;
    }
  }
  async listReportSalesperson(
    dataStart: string,
    dataEnd: string,
    salespersonId?: string,
  ): Promise<SalespersonReport | null> {
    try {
      const params = new URLSearchParams({
        dataStart,
        dataEnd,
      });
      if (salespersonId) {
        params.append('employeeId', salespersonId);
      }
      const { data: response } = await apiClient.get(
        `/store/${getStoreStorageId()}/reports/deals/salesperson?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return null;
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return null;
      }
      return null;
    }
  }
  async findEmployee(): Promise<EmployeeList | null> {
    try {
      const { data: response } = await apiClient.get('/employees/search-employees');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return null;
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return null;
      }
      return null;
    }
  }
}
export const reportsService = new ReportsService();
