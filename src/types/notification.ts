export interface Notification {
  id: string;
  userId: string;
  idReference?: string;
  type: NotificationType;
  message: string;
  status: NotificationStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}
export enum NotificationStatus {
  PENDING = 'PENDING',
  VIEWED = 'VIEWED',
  ARCHIVED = 'ARCHIVED',
}
export enum NotificationType {
  NEW_DEAL = 'NEW_DEAL',
  NEW_MESSAGE = 'NEW_MESSAGE',
  MESSAGES_NOT_READ = 'MESSAGES_NOT_READ',
  TASK_CREATED = 'TASK_CREATED',
  TASKS_DAY = 'TASKS_DAY',
  TASK_COMPLETED = 'TASK_COMPLETED',
  DEAL_TRANSFERRED = 'DEAL_TRANSFERRED',
  DEAL_SHARED = 'DEAL_SHARED',
  VISIT_SCHEDULED = 'VISIT_SCHEDULED',
  VISIT_DAY = 'VISIT_DAY',
  VISIT_COMPLETED = 'VISIT_COMPLETED',
  TICKET_CREATED = 'TICKET_CREATED',
  TICKET_WITHOUT_REPLY = 'TICKET_WITHOUT_REPLY',
}
