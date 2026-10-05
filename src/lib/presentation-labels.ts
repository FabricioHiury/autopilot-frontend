const roleLabels: Record<string, string> = {
  Salesperson: 'Vendedor',
  'Pre-salesperson': 'Pré-vendedor',
  Manager: 'Administrador da loja',
  Agent: 'Atendente',
};
const supportLabels: Record<string, string> = {
  Integration: 'Integração',
  Chat: 'Chat',
  Deals: 'Negociações',
  Account: 'Conta',
  Other: 'Outros',
  normal: 'Normal',
  urgent: 'Urgente',
  open: 'Em aberto',
  'at resolution': 'Em resolução',
  closed: 'Resolvido',
};
export const roleLabel = (value: string) => roleLabels[value] || value;
export const supportLabel = (value: string) => supportLabels[value] || value;
