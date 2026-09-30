export enum STATUS_ATENDIMENTO {
    CHAT = 'chat',
    PRE_ATENDIMENTO = 'preAtendimento',
    ATENDIMENTO_INICIAL = 'atendimentoInicial',
    VISITA = 'visita',
    EM_NEGOCIACAO = 'emNegociacao',
    RESGATE = 'resgate',
    SUCESSO = 'sucesso',
    PERDIDO = 'perdido',
}

export enum STATUS_ATENDIMENTO_LABEL {
    CHAT = 'Chat',
    PRE_ATENDIMENTO = 'Pré-atendimento',
    ATENDIMENTO_INICIAL = 'Atendimento Inicial',
    VISITA = 'Visita',
    EM_NEGOCIACAO = 'Em Negociação',
    RESGATE = 'Resgate',
    SUCESSO = 'Sucesso',
    PERDIDO = 'Perdido',
}

export enum STATUS_ATENDIMENTO_COLOR {
    CHAT = '#7F8999',
    PRE_ATENDIMENTO = '#FFC107',
    ATENDIMENTO_INICIAL = '#E84C43',
    VISITA = '#CEBC1A',
    EM_NEGOCIACAO = '#FFA500',
    RESGATE = '#CC0000',
    SUCESSO = '#00CC00',
    PERDIDO = '#333333',
}

export const STATUS_ATENDIMENTO_HISTORICO: Record<string, string> = {
  chat: "Chat",
  preAtendimento: "Pré-atendimento",
  atendimentoInicial: "Atendimento inicial",
  visita: "Visita",
  emNegociacao: "Em negociação",
  resgate: "Resgate",
  sucesso: "Sucesso",
  perdido: "Perdido",
};

export const STATUS_ATENDIMENTO_ARQUIVADOS = {
    [STATUS_ATENDIMENTO.EM_NEGOCIACAO]: STATUS_ATENDIMENTO_LABEL.EM_NEGOCIACAO,
    [STATUS_ATENDIMENTO.RESGATE]: STATUS_ATENDIMENTO_LABEL.RESGATE,
    [STATUS_ATENDIMENTO.SUCESSO]: STATUS_ATENDIMENTO_LABEL.SUCESSO,
    [STATUS_ATENDIMENTO.PERDIDO]: STATUS_ATENDIMENTO_LABEL.PERDIDO,
    [STATUS_ATENDIMENTO.PRE_ATENDIMENTO]: STATUS_ATENDIMENTO_LABEL.PRE_ATENDIMENTO,
}
