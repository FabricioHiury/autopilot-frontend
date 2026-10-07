import { AxiosError } from 'axios';
import { DealCommentList, DealComment } from '@/lib/api-response-types';
import { DealDetails, DealListResponse } from '@/types/deal';
import { DealStatus } from '@/types/deal-status';
import { DealAttachmentList, ChatAttachment } from '@/types/deal-attachment';
import { DealVisit } from '@/types/visit';
import { DealTag } from '@/types/tag';
import { apiClient, type ApiResult } from './api.client';
export class DealService {
  deal = {
    list: this.listDeals,
    listChats: this.listChatsDeal,
    get: this.getDeal,
    updateStatus: this.updateStatusDeal,
    editOrigin: this.editOriginDeal,
    editTitle: this.editTitleDeal,
    editDescription: this.editDescriptionDeal,
    comments: this.listCommentsDeal,
    addComment: this.addCommentDeal,
    listTasks: this.listTasksDeal,
    createTask: this.createTaskDeal,
    editTask: this.editTaskDeal,
    getTask: this.getTaskDeal,
    completeTask: this.completeTaskDeal,
    deleteTask: this.deleteTaskDeal,
    listAttachments: this.listAttachmentsDeal,
    chatAttachments: this.listAttachmentsDealChat,
    createVisit: this.createVisitDeal,
    listVisits: this.listVisitsDeal,
    updateVisitStatus: this.updateStatusVisit,
    deleteVisit: this.deleteVisit,
    editCustomer: this.editCustomerDeal,
    addShare: this.addShareDeal,
    removeShare: this.removeShareDeal,
    listShares: this.listShareDeal,
    listSuspensions: this.listSuspensionDeal,
    createSuspension: this.createSuspensionDeal,
    updateSuspension: this.updateSuspensionDeal,
    removeSuspension: this.removeSuspensionDeal,
    verifySuspension: this.verifySuspensionDeal,
    listHistoryCustomer: this.listHistoryCustomerDeal,
    createTag: this.registerTagDeal,
    findTags: this.findTagsDeal,
    updateTag: this.updateTagDeal,
    removeTag: this.removeTagDeal,
    linkTag: this.linkTagDeal,
    archive: this.archiveDeal,
    unarchive: this.unarchiveDeal,
    remove: this.removeDeal,
  };
  async listDeals({
    search,
    dealMode,
    origin,
    employeeIds,
    page,
    status,
    itemsPage,
    dataStart,
    dataEnd,
    orderBy,
    orderDirection,
    assignedTasks,
    phoneLike,
    isArchived,
    idTag,
  }: {
    search?: string;
    dealMode?: string;
    origin?: string;
    employeeIds?: string[];
    page?: number;
    status?: DealStatus;
    itemsPage?: number;
    dataStart?: Date;
    dataEnd?: Date;
    orderBy?: 'createdAt' | 'updatedAt' | 'status';
    orderDirection?: 'asc' | 'desc' | 'status';
    assignedTasks?: string;
    phoneLike?: string;
    isArchived?: boolean;
    idTag?: string;
  }): Promise<ApiResult<DealListResponse>> {
    try {
      const { data: response } = await apiClient.get('/deals', {
        params: {
          search,
          dealMode,
          status,
          origin,
          employeeIds: employeeIds?.join(','),
          page,
          itemsPage,
          dataInitial: dataStart?.toISOString(),
          dataFinal: dataEnd?.toISOString(),
          orderBy,
          orderDirection,
          tasksAssigned: assignedTasks,
          phoneLike,
          isArchived,
          idTag,
        },
      });
      return [response.data as DealListResponse, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para listar os atendimentos' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível listar os atendimentos' }];
    }
  }
  async listChatsDeal({
    search,
    dealMode,
    origin,
    employeeIds,
    page,
    status,
    itemsPage,
    dataStart,
    dataEnd,
    orderBy,
    orderDirection,
    phoneLike,
  }: {
    search?: string;
    dealMode?: string;
    origin?: string;
    employeeIds?: string[];
    page?: number;
    status?: DealStatus;
    itemsPage?: number;
    dataStart?: Date;
    dataEnd?: Date;
    orderBy?: 'createdAt' | 'updatedAt' | 'status';
    orderDirection?: 'asc' | 'desc' | 'status';
    phoneLike?: string;
  }): Promise<ApiResult<DealListResponse>> {
    try {
      const { data: response } = await apiClient.get('/deals/list-chats', {
        params: {
          search,
          dealMode,
          origin,
          employeeIds: employeeIds?.join(','),
          page,
          itemsPage,
          dataInitial: dataStart?.toISOString(),
          dataFinal: dataEnd?.toISOString(),
          orderBy,
          orderDirection,
          phoneLike,
        },
      });
      return [response.data as DealListResponse, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para listar as conversas' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível listar as conversas' }];
    }
  }
  async getDeal(dealId: string): Promise<ApiResult<DealDetails>> {
    try {
      const { data: response } = await apiClient.get(`/deals/${dealId}`);
      return [response.data as DealDetails, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para pegar os atendimentos' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível pegar o atendimento' }];
    }
  }
  async updateStatusDeal(params: {
    id: string;
    status: DealStatus;
    dealOrigin?: string;
    temperature: 'COLD' | 'HOT' | 'WARM';
    idAssignees: string[];
    note: string;
  }): Promise<ApiResult<any>> {
    try {
      const { id, ...data } = params;
      await apiClient.patch(`/deals/${id}/status`, data);
      return [{ message: 'ok' }, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message: 'Você não tem permissão para alterar o status do atendimento',
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 403) {
        return [null, { message: 'Você não tem permissão para alterar o status do atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível alterar o status do atendimento' }];
    }
  }
  async editOriginDeal(
    id: string,
    dealOrigin: string,
    idAssignees?: string[],
    idTags?: string[],
  ): Promise<ApiResult<any>> {
    try {
      const body: any = { dealOrigin };
      if (idAssignees && idAssignees.length) {
        body.idAssignees = idAssignees;
      }
      if (idTags && idTags.length) {
        body.idTags = idTags;
      }
      await apiClient.patch(`/deals/${id}/status`, body);
      return [{ message: 'ok' }, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para alterar o atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 403) {
        return [null, { message: 'Você não tem permissão para alterar o atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível alterar o atendimento' }];
    }
  }
  async editTitleDeal(params: { id: string; title: string }): Promise<ApiResult<any>> {
    try {
      const { id, ...data } = params;
      await apiClient.patch(`/deals/${id}/update-title`, data);
      return [{ message: 'ok' }, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para alterar o atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível alterar o atendimento' }];
    }
  }
  async editDescriptionDeal(params: { id: string; description: string }): Promise<ApiResult<any>> {
    try {
      const { id, ...data } = params;
      await apiClient.patch(`/deals/${id}/update-description`, data);
      return [{ message: 'ok' }, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para alterar o atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível alterar o atendimento' }];
    }
  }
  async listCommentsDeal(
    dealId: string,
    params?: {
      page: number;
      itemsPage: number;
    },
  ): Promise<ApiResult<DealCommentList>> {
    try {
      const { data: response } = await apiClient.get(
        `/deals/${dealId}/comments?page=${params?.page || 1}&itemsPage=${params?.itemsPage || 10}`,
      );
      return [response.data as DealCommentList, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: 'Você não tem permissão para listar os comentários do atendimento' },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível listar os comentários do atendimento' }];
    }
  }
  async addCommentDeal(params: {
    dealId: string;
    comment: string;
  }): Promise<ApiResult<DealComment>> {
    try {
      const { data: response } = await apiClient.post(`/deals/${params.dealId}/comments`, {
        comment: params.comment,
      });
      return [response.data as DealComment, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: 'Você não tem permissão para adicionar comentários ao atendimento' },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível adicionar comentários ao atendimento' }];
    }
  }
  async listTasksDeal(dealId: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.get(`/deals/${dealId}/tasks`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para listar as tarefas do atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível listar as tarefas do atendimento' }];
    }
  }
  async createTaskDeal(
    dealId: string,
    tarefa: {
      name: string;
      notes: string;
      assigneeId: string;
      hourStart?: string;
      hourEnd: string;
      data: string;
    },
  ): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.post(`/deals/${dealId}/tasks`, tarefa);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para criar tarefas no atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível criar tarefas no atendimento' }];
    }
  }
  async editTaskDeal(
    dealId: string,
    taskId: string,
    tarefa: {
      name: string;
      notes?: string;
      assigneeId: string;
      hourStart?: string;
      hourEnd: string;
      data: string;
    },
  ): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.put(`/deals/${dealId}/tasks/${taskId}`, tarefa);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para editar tarefas no atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível editar tarefas no atendimento' }];
    }
  }
  async getTaskDeal(dealId: string, taskId: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.get(`/deals/${dealId}/tasks/${taskId}`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para pegar tarefas no atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível pegar tarefas no atendimento' }];
    }
  }
  async completeTaskDeal(dealId: string, taskId: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.post(`/deals/${dealId}/tasks/${taskId}`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para concluir tarefas no atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível concluir tarefas no atendimento' }];
    }
  }
  async deleteTaskDeal(dealId: string, taskId: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.delete(`/deals/${dealId}/tasks/${taskId}`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para deletar tarefas no atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível deletar tarefas no atendimento' }];
    }
  }
  async listAttachmentsDeal(params: {
    dealId: string;
    limit: number;
    page: number;
  }): Promise<ApiResult<DealAttachmentList>> {
    try {
      const { data: response } = await apiClient.get(
        `/deals/${params.dealId}/attachments?itemsByPage=${params.limit}&page=${params.page}`,
      );
      return [response.data as DealAttachmentList, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para listar anexos no atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível listar anexos no atendimento' }];
    }
  }
  async listAttachmentsDealChat(params: { dealId: string }): Promise<ApiResult<ChatAttachment[]>> {
    try {
      const { data: response } = await apiClient.get(`/deals/${params.dealId}/attachments-chat`);
      return [response.data as ChatAttachment[], null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para listar anexos no atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível listar anexos no atendimento' }];
    }
  }
  async createVisitDeal(visita: {
    type: string;
    dealId: string;
    hourStart: string;
    hourEnd?: string;
    data: string;
  }): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.post(`/deals/${visita.dealId}/visits`, {
        type: visita.type,
        hourStart: visita.hourStart,
        hourEnd: visita.hourEnd,
        data: visita.data,
      });
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para criar visitas no atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível criar visitas no atendimento' }];
    }
  }
  async listVisitsDeal(dealId: string): Promise<ApiResult<DealVisit[]>> {
    try {
      const { data: response } = await apiClient.get(`/deals/${dealId}/visits`);
      return [response.data as DealVisit[], null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para listar as tarefas do atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível listar as tarefas do atendimento' }];
    }
  }
  async updateStatusVisit(dealId: string, visitId: string): Promise<ApiResult<DealVisit>> {
    try {
      const { data: response } = await apiClient.post(`/deals/${dealId}/visits/${visitId}`);
      return [response.data as DealVisit, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message: 'Você não tem permissão para alterar visitas do atendimento',
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível listar alterar visita do atendimento' }];
    }
  }
  async deleteVisit(dealId: string, visitId: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.delete(`/deals/${dealId}/visits/${visitId}`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para deletar visitas do atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível deletar visita do atendimento' }];
    }
  }
  async editCustomerDeal(dealId: string, customerId: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.put(
        `/deals/${dealId}/update-customer/${customerId}`,
      );
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para editar o cliente do atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao editar o cliente do atendimento' }];
    }
  }
  async addShareDeal(dealId: string, employeeId: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.post(`/deals/${dealId}/share/${employeeId}`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message: 'Você não tem permissão para adicionar compartilhamento no atendimento',
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao adicionar compartilhamento no atendimento' }];
    }
  }
  async removeShareDeal(dealId: string, employeeId: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.delete(`/deals/${dealId}/share/${employeeId}`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message: 'Você não tem permissão para remover compartilhamento no atendimento',
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao remover compartilhamento no atendimento' }];
    }
  }
  async listShareDeal(dealId: string): Promise<
    ApiResult<
      {
        id: string;
        employee: {
          id: string;
          name: string;
          whatsapp: string;
          userId: string;
          roles: {
            role: string;
          }[];
        };
      }[]
    >
  > {
    try {
      const { data: response } = await apiClient.get(`/deals/${dealId}/share`);
      return [
        response.data as {
          id: string;
          employee: {
            id: string;
            name: string;
            whatsapp: string;
            userId: string;
            roles: {
              role: string;
            }[];
          };
        }[],
        null,
      ];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message: 'Você não tem permissão para listar compartilhamento no atendimento',
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao listar compartilhamento no atendimento' }];
    }
  }
  async registerTagDeal(data: DealTag): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.post(`/tags`, data);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message: 'Você não tem permissão para registrar etiqueta no atendimento',
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao registrar etiqueta no atendimento' }];
    }
  }
  async findTagsDeal(): Promise<ApiResult<DealTag[]>> {
    try {
      const { data: response } = await apiClient.get(`/tags`);
      return [response.data.tags as DealTag[], null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message: 'Você não tem permissão para buscar etiquetas no atendimento',
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao buscar etiquetas no atendimento' }];
    }
  }
  async updateTagDeal(idTag: string, data: DealTag): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.put(`/tags/${idTag}`, data);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message: 'Você não tem permissão para atualizar etiqueta no atendimento',
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao atualizar etiqueta no atendimento' }];
    }
  }
  async removeTagDeal(idTag: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.delete(`/tags/${idTag}`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message: 'Você não tem permissão para remover etiqueta no atendimento',
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao remover etiqueta no atendimento' }];
    }
  }
  async linkTagDeal(
    dealId: string,
    idTags: string[],
    idAssignees: string[],
    dealOrigin?: string,
  ): Promise<ApiResult<any>> {
    try {
      const payload: any = { idTags, idAssignees };
      if (dealOrigin) payload.dealOrigin = dealOrigin;
      const { data: response } = await apiClient.patch(`/deals/${dealId}/status`, payload);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message: 'Você não tem permissão para vincular etiqueta no atendimento',
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao vincular etiqueta no atendimento' }];
    }
  }
  async archiveDeal(dealId: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.patch(`/deals/${dealId}/archive`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para arquivar o atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao arquivar o atendimento' }];
    }
  }
  async unarchiveDeal(dealId: string): Promise<ApiResult<any>> {
    try {
      const { data: response } = await apiClient.patch(`/deals/${dealId}/unarchive`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para desarquivar o atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao desarquivar o atendimento' }];
    }
  }
  async removeDeal(dealId: string): Promise<ApiResult<void>> {
    try {
      await apiClient.delete(`/deals/${dealId}`);
      return [undefined, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para remover o atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao remover o atendimento' }];
    }
  }
  async listSuspensionDeal({
    userId,
    description,
    startDateInicio,
    startDateFim,
    ativas,
    page = 1,
    itemsPage = 10,
  }: {
    userId?: string;
    description?: string;
    startDateInicio?: string;
    startDateFim?: string;
    ativas?: boolean;
    page?: number;
    itemsPage?: number;
  }): Promise<
    ApiResult<{
      data: {
        id: string;
        userId: string;
        description: string;
        startDate: string;
        endDate: string;
        createdAt: string;
        updatedAt: string;
        user: {
          id: string;
          name: string;
          email: string;
          avatar: {
            file: {
              url: string;
            };
          };
        };
      }[];
      meta: {
        page: number;
        itemsPage: number;
        total: number;
        totalPages: number;
      };
    }>
  > {
    try {
      const { data: response } = await apiClient.get('/suspension', {
        params: {
          userId,
          description,
          startDateStart: startDateInicio,
          startDateEnd: startDateFim,
          active: ativas,
          page: Number(page),
          itemsPage: Number(itemsPage),
        },
      });
      return [response.data, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para listar suspensões' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível listar as suspensões' }];
    }
  }
  async createSuspensionDeal(data: {
    userId: string;
    description: string;
    startDate: string;
    endDate: string;
  }): Promise<
    ApiResult<{
      id: string;
      userId: string;
      description: string;
      startDate: string;
      endDate: string;
      createdAt: string;
      updatedAt: string;
    }>
  > {
    try {
      const { data: response } = await apiClient.post('/suspension', data);
      return [response.data, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para criar suspensões' }];
      }
      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: 'Usuário não encontrado' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível criar a suspensão' }];
    }
  }
  async updateSuspensionDeal(
    id: string,
    data: {
      userId?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<
    ApiResult<{
      id: string;
      userId: string;
      description: string;
      startDate: string;
      endDate: string;
      createdAt: string;
      updatedAt: string;
    }>
  > {
    try {
      const { data: response } = await apiClient.put(`/suspension/${id}`, data);
      return [response.data, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para atualizar suspensões' }];
      }
      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: 'Suspensão ou usuário não encontrado' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível atualizar a suspensão' }];
    }
  }
  async removeSuspensionDeal(id: string): Promise<
    ApiResult<{
      message: string;
    }>
  > {
    try {
      const { data: response } = await apiClient.delete(`/suspension/${id}`);
      return [response.data, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para remover suspensões' }];
      }
      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: 'Suspensão não encontrada' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível remover a suspensão' }];
    }
  }
  async verifySuspensionDeal(userId: string): Promise<
    ApiResult<{
      suspenso: boolean;
    }>
  > {
    try {
      const { data: response } = await apiClient.get(`/suspension/user/${userId}/suspended`);
      return [response.data, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para verificar suspensões' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Não foi possível verificar a suspensão' }];
    }
  }
  async listHistoryCustomerDeal(dealId: string): Promise<
    ApiResult<{
      logs: any[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>
  > {
    try {
      if (!dealId) {
        return [null, { message: 'É necessário informar idAtendimento.' }];
      }
      const { data: response } = await apiClient.get(`/deals/${dealId}/logs`);
      return [
        response.data as {
          logs: any[];
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        },
        null,
      ];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: 'Você não tem permissão para listar os logs do atendimento' }];
      }
      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: 'Logs do atendimento não encontrados.' }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: 'Erro no servidor.' }];
      }
      return [null, { message: 'Erro ao buscar os logs do atendimento.' }];
    }
  }
}
export const dealService = new DealService();
