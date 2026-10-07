import {
  MOTIVOS_LABEL,
  SUBMOTIVOS_LABEL,
  DealLossReason,
  DealLossSubReason,
} from '@/types/deal-loss';
import { StorePermissionLabels } from '@/types/permissions';

const labels: Record<string, string> = {
  seller: 'Vendedor',
  'pre-seller': 'Pré-vendedor',
  'store owner': 'Proprietário',
  'new customer': 'Novo cliente',
  'new lead': 'Novo contato',
  interested: 'Interessado',
  'in progress': 'Em andamento',
  'follow up': 'Acompanhamento',
  appointment: 'Agendamento',
  salesperson: 'Vendedor',
  'pre-salesperson': 'Pré-vendedor',
  presalesperson: 'Pré-vendedor',
  manager: 'Administrador da loja',
  agent: 'Atendente',
  administrator: 'Administrador',
  autopilot: 'Administrador da plataforma',
  admin: 'Administrador',
  storeowner: 'Proprietário',
  owner: 'Proprietário',
  user: 'Colaborador',
  integration: 'Integração',
  chat: 'Conversa',
  deals: 'Atendimentos',
  deal: 'Atendimento',
  account: 'Conta',
  other: 'Outros',
  normal: 'Normal',
  urgent: 'Urgente',
  open: 'Em aberto',
  'at resolution': 'Em resolução',
  closed: 'Resolvido',
  draft: 'Rascunho',
  published: 'Publicado',
  hot: 'Quente',
  warm: 'Morno',
  cold: 'Frio',
  unknown: 'Não identificado',
  predeal: 'Pré-atendimento',
  dealinitial: 'Atendimento inicial',
  visit: 'Visita',
  atnegotiation: 'Em negociação',
  recovery: 'Resgate',
  success: 'Sucesso',
  lost: 'Perdido',
  active: 'Ativo',
  inactive: 'Inativo',
  pending: 'Pendente',
  completed: 'Concluído',
  individual: 'Pessoa física',
  legalentity: 'Pessoa jurídica',
  buy: 'Compra',
  sell: 'Venda',
  consignment: 'Consignação',
  testdrive: 'Teste de direção',
  'test drive': 'Teste de direção',
  test_drive: 'Teste de direção',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
  olx: 'OLX',
  website: 'Site',
  site: 'Site',
  phone: 'Telefone',
  email: 'E-mail',
  referral: 'Indicação',
  manual: 'Cadastro manual',
  walkin: 'Visita espontânea',
  'walk-in': 'Visita espontânea',
  lead: 'Contato interessado',
  leads: 'Contatos interessados',
  new: 'Novo',
  qualified: 'Qualificado',
  unqualified: 'Não qualificado',
  vip: 'Cliente especial',
  followup: 'Acompanhamento',
  'follow-up': 'Acompanhamento',
  customer: 'Cliente',
  prospect: 'Potencial cliente',
  financing: 'Financiamento',
  'trade-in': 'Troca',
  tradein: 'Troca',
  cash: 'À vista',
  online: 'Conectado',
  offline: 'Desconectado',
  connecting: 'Conectando',
  disconnected: 'Desconectado',
  connected: 'Conectado',
  not_configured: 'Não configurado',
  error: 'Erro',
  ok: 'Conectado',
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
  support: 'Suporte',
  feedback: 'Avaliação',
};
// Translate known system values only; preserve names supplied by users.
export function presentationLabel(value: string | null | undefined): string {
  if (!value) return '';
  return labels[value.trim().toLowerCase()] || value;
}
export const roleLabel = presentationLabel;
export const supportLabel = presentationLabel;
export const tagLabel = presentationLabel;
export const channelLabel = presentationLabel;

const adminPermissions: Record<string, string> = {
  autopilotViewDashboard: 'Visualizar painel',
  autopilotReplyTickets: 'Responder chamados',
  autopilotViewTickets: 'Visualizar chamados',
  autopilotUpdatePanelReseller: 'Gerenciar concessionárias',
  autopilotUpdatePermissions: 'Gerenciar permissões',
  autopilotCreateUserAdmin: 'Criar administrador',
  autopilotViewUsersAdmin: 'Visualizar administradores',
};
export function permissionLabel(value: string): string {
  return (
    StorePermissionLabels[value as keyof typeof StorePermissionLabels] ||
    adminPermissions[value] ||
    'Permissão adicional'
  );
}

export function lossReasonLabel(value: string | undefined): string {
  if (!value) return 'Não informado';
  return (
    MOTIVOS_LABEL[value as DealLossReason] ||
    SUBMOTIVOS_LABEL[value as DealLossSubReason] ||
    'Outro motivo'
  );
}
