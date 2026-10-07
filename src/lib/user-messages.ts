import { presentationLabel } from './presentation-labels';
const fieldLabels: Record<string, string> = {
  phone: 'Telefone',
  number: 'Número',
  email: 'E-mail',
  password: 'Senha',
  name: 'Nome',
  nameComplete: 'Nome completo',
  title: 'Título',
  role: 'Cargo',
  features: 'Permissões',
  category: 'Categoria',
  status: 'Situação',
  tags: 'Etiquetas',
  content: 'Conteúdo',
  recipient: 'Destinatário',
  text: 'Mensagem',
  message: 'Mensagem',
  channel: 'Canal',
  storeId: 'Loja',
  customerId: 'Cliente',
  dealId: 'Atendimento',
  chatId: 'Conversa',
  userId: 'Usuário',
  taxId: 'CPF/CNPJ',
  birthDate: 'Data de nascimento',
  postalCode: 'CEP',
  city: 'Cidade',
  state: 'Estado',
  street: 'Rua',
  district: 'Bairro',
  data: 'Data',
  createdAt: 'Criado em',
  updatedAt: 'Atualizado em',
  id: 'Identificador',
  hourStart: 'Horário inicial',
  hourEnd: 'Horário final',
  completed: 'Concluído',
  type: 'Tipo',
  typePerson: 'Tipo de pessoa',
  descriptionDeal: 'Descrição do atendimento',
  dealOrigin: 'Origem do atendimento',
  idAssignees: 'Responsáveis',
  note: 'Observação',
  temperature: 'Grau de interesse',
  dealMode: 'Tipo de negociação',
  notes: 'Observações',
  description: 'Descrição',
  url: 'Endereço',
  site: 'Site',
  accessToken: 'Credencial de acesso',
};
const messages: Record<string, string> = {
  unauthorized: 'Sua sessão expirou. Entre novamente.',
  forbidden: 'Você não tem permissão para realizar esta ação.',
  'forbidden resource': 'Você não tem permissão para realizar esta ação.',
  'not found': 'Registro não encontrado.',
  'bad request': 'Confira os dados informados.',
  'internal server error': 'Ocorreu um erro no servidor. Tente novamente.',
  'network error': 'Não foi possível conectar ao servidor.',
  'failed to fetch': 'Não foi possível conectar ao servidor.',
  'invalid credentials': 'E-mail ou senha incorretos.',
  'invalid email or password': 'E-mail ou senha incorretos.',
  'chat ai provider is not configured': 'A IA AutoPilot ainda não está configurada neste ambiente.',
  'integration whatsapp not configured': 'A integração com o WhatsApp não está configurada.',
  'whatsapp integration is not configured': 'A integração com o WhatsApp não está configurada.',
  'service temporarily unavailable': 'Serviço temporariamente indisponível. Tente novamente.',
  'reply invalid of microservice':
    'Não foi possível verificar o número do WhatsApp. Tente novamente.',
  'parameters invalid.': 'Confira os dados informados.',
};
export function userMessage(input: unknown, status?: number): string {
  if (Array.isArray(input)) return input.map((value) => userMessage(value, status)).join(' · ');
  const text = typeof input === 'string' ? input.trim() : '';
  const key = text.toLowerCase().replace(/[.!]$/, '');
  const exact = messages[key] || messages[text.toLowerCase()];
  if (exact) return exact;
  const validation = text.match(
    /^(?:property )?([\w.[\]]+) (should not exist|should not be empty|must be a string|must be a number.*|must be an integer.*|must be a boolean.*|must be an array|must be a UUID|must be an email|must be a valid.*|must be one of the following values:.*|must be longer than or equal to (\d+) characters|must be shorter than or equal to (\d+) characters)$/i,
  );
  if (validation) {
    const field = fieldLabels[validation[1]] || 'Campo informado';
    const rule = validation[2];
    if (rule === 'should not exist') return field + ': campo não permitido.';
    if (rule === 'should not be empty') return field + ': preenchimento obrigatório.';
    if (rule.includes('longer'))
      return field + ': use pelo menos ' + validation[3] + ' caracteres.';
    if (rule.includes('shorter'))
      return field + ': use no máximo ' + validation[4] + ' caracteres.';
    if (rule === 'must be an email') return field + ': informe um e-mail válido.';
    return field + ': informe um valor válido.';
  }
  if (/not found[.!]?$/i.test(text)) return 'Registro não encontrado.';
  if (/already (exists|registered|in use)/i.test(text)) return 'Este registro já está cadastrado.';
  if (/timeout|timed out/i.test(text)) return 'O servidor demorou para responder. Tente novamente.';
  // Keep Portuguese responses; never expose unrecognized provider diagnostics to the user.
  if (
    /[áàâãéêíóôõúç]/i.test(text) ||
    /\b(erro|não|nao|campo|informe|selecione|dados|inválido|obrigatório|senha|permissão|voce|você|cadastro|cadastrado|sucesso|falha|encontrado|preencha|somente|apenas|precisa|deve|possível)\b/i.test(
      text,
    )
  )
    return text;
  if (status === 401) return 'Sua sessão expirou. Entre novamente.';
  if (status === 403) return 'Você não tem permissão para realizar esta ação.';
  if (status === 404) return 'Registro não encontrado.';
  if (status === 409) return 'Já existe um registro com esses dados.';
  if (status === 400 || status === 422) return 'Confira os dados informados e tente novamente.';
  if (status && status >= 500) return 'Ocorreu um erro no servidor. Tente novamente.';
  return 'Não foi possível concluir a operação. Tente novamente.';
}

export function integrationMessage(text: string): string {
  if (text === 'open') return 'Conectado';
  if (text === 'close' || text === 'closed') return 'Desconectado';
  const label = presentationLabel(text);
  if (label !== text) return label;
  const known: Record<string, string> = {
    'connection closed': 'Conexão encerrada',
    'connection open': 'Conexão ativa',
    'instance not found': 'Conexão não configurada',
    'evolution is not configured': 'O serviço de WhatsApp não está configurado.',
    'integration not configured': 'Integração não configurada',
    configured: 'Configurado',
  };
  return known[text.trim().toLowerCase()] || userMessage(text);
}

export function historyDetails(value: unknown): string {
  function localize(input: unknown, field?: string): unknown {
    if (Array.isArray(input)) return input.map((item) => localize(item, field));
    if (input && typeof input === 'object')
      return Object.fromEntries(
        Object.entries(input).map(([key, item]) => [
          fieldLabels[key] || 'Informação adicional (' + Object.keys(input).indexOf(key) + ')',
          localize(item, key),
        ]),
      );
    if (typeof input === 'boolean') return input ? 'Sim' : 'Não';
    if (
      typeof input === 'string' &&
      [
        'status',
        'role',
        'channel',
        'temperature',
        'type',
        'typePerson',
        'dealMode',
        'dealOrigin',
        'category',
      ].includes(field || '')
    )
      return presentationLabel(input);
    return input;
  }
  return JSON.stringify(localize(value), null, 2);
}
