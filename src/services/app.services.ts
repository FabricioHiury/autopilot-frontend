import { AuthService } from './auth.service';
import { RoleService } from './role.service';
import { IntegrationService } from './integration.service';
import { EmployeeService } from './employee.service';
import { CustomerService } from './customer.service';
import { DealService } from './deal.service';
import { ChatService } from './chat.service';
import { MessageTemplateService } from './message-template.service';
import { NotificationService } from './notification.service';
import { FaqService } from './faq.service';
import { SupportService } from './support.service';
import { DistributionService } from './distribution.service';
import { ReportsService } from './reports.service';
export type { MessageTemplate } from '@/types/message-template';
export class AppServices {
  readonly auth = new AuthService().auth;
  readonly role = new RoleService().role;
  readonly integrations = new IntegrationService().integrations;
  readonly employee = new EmployeeService().employee;
  readonly customer = new CustomerService().customer;
  readonly deal = new DealService().deal;
  readonly chat = new ChatService().chat;
  readonly messageTemplates = new MessageTemplateService().messageTemplates;
  readonly notifications = new NotificationService().notifications;
  readonly faq = new FaqService().faq;
  readonly support = new SupportService().support;
  readonly distributionAutomatic = new DistributionService().distributionAutomatic;
  readonly reports = new ReportsService().reports;
}
