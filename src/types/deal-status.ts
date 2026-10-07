export enum DealStatus {
  CHAT = 'chat',
  PRE_DEAL = 'preDeal',
  DEAL_INITIAL = 'dealInitial',
  VISIT = 'visit',
  AT_NEGOTIATION = 'atNegotiation',
  RECOVERY = 'recovery',
  SUCCESS = 'success',
  LOST = 'lost',
}
export enum DealStatusLabel {
  CHAT = 'Conversa',
  PRE_DEAL = 'Pré-atendimento',
  DEAL_INITIAL = 'Atendimento Inicial',
  VISIT = 'Visita',
  AT_NEGOTIATION = 'Em Negociação',
  RECOVERY = 'Resgate',
  SUCCESS = 'Sucesso',
  LOST = 'Perdido',
}
export enum DealStatusColor {
  CHAT = '#7F8999',
  PRE_DEAL = '#FFC107',
  DEAL_INITIAL = '#E84C43',
  VISIT = '#CEBC1A',
  AT_NEGOTIATION = '#FFA500',
  RECOVERY = '#CC0000',
  SUCCESS = '#00CC00',
  LOST = '#333333',
}
export const DealStatusHistory: Record<string, string> = {
  chat: 'Conversa',
  preDeal: 'Pré-atendimento',
  dealInitial: 'Atendimento inicial',
  visit: 'Visita',
  atNegotiation: 'Em negociação',
  recovery: 'Resgate',
  success: 'Sucesso',
  lost: 'Perdido',
};
export const ArchivedDealStatuses = {
  [DealStatus.AT_NEGOTIATION]: DealStatusLabel.AT_NEGOTIATION,
  [DealStatus.RECOVERY]: DealStatusLabel.RECOVERY,
  [DealStatus.SUCCESS]: DealStatusLabel.SUCCESS,
  [DealStatus.LOST]: DealStatusLabel.LOST,
  [DealStatus.PRE_DEAL]: DealStatusLabel.PRE_DEAL,
};
