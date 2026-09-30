import { STATUS_ATENDIMENTO } from "./status-atentimento-enum";

export interface ColunaEtapaType {
  id: string;
  etapa: STATUS_ATENDIMENTO;
  nomeEtapa: string;
  color: string;
  items: ItemAtendimentoType[];
}

export interface ItemAtendimentoType {
  id: string;
  data: {
    etapa: STATUS_ATENDIMENTO;
    status: STATUS_ATENDIMENTO;
    canais: Array<"whatsapp" | "instagram" | "facebook" | "olx" | "outros">;
    origemAtendimento?: string;
    temperatura?: "quente" | "morno" | "frio";
    nome: string;
    titulo?: string;
    avatar?: string;
    email?: string;
    telefone?: string;
    responsavel?: string;
    responsaveis: { id: string; nome: string; whatsapp?: string | null; idUsuario: string }[];
    responsavelAvatar?: string;
    totalNotas?: number;
    totalArquivos?: number;
    totalTarefas?: number;
    comentarios?: number;
    // Adiciona tags retornadas pelo backend
    tags?: { id: string; nome: string; descricao?: string; cor?: string }[];
    // Adiciona lista de chats para renderização de ícones/ações
    chats?: { id: string; canal: string }[];
  };
}

export interface ResponseListAtentimentoType {
  pesquisa: string;
  modoAtendimento: string;
  origem: string;
  colaboradorIds: string[];
  pagina: number;
  itensPagina: number;
  dataInicial: string;
  dataFinal: string;
  atendimentos: AtentimentoItemListType[];
}

export interface AtentimentoItemListType {
  id: string;
  titulo: string;
  descricaoAtendimento: string;
  origemAtendimento: string;
  temperatura: string;
  modoAtendimento: string;
  status: string;
  criadoEm: string;
  atualizadoEm: string;
  cliente: ClienteAtentimentoItemListType | null;
  responsaveis: ResponsavelAtentimentoItemListType[];
  tarefas: number;
  comentarios: number;
  chats: {
    id: string;
    canal: string;
  }[];
  tags: {
    id: string;
    nome: string;
    descricao: string;
    cor: string;
  }[];
}

export interface AtendimentoCompletoType {
  id: string;
  cliente?: {
    id: string;
    whatsapp: string;
    email: string;
    urlAvatar: string;
    nome: string;
  };
  clienteTemporario?: {
    id?: string;
    nome: string;
    email: string;
    whatsapp: string;
    avatar?: string;
  };
  idCliente?: string;
  criadoEm: string;
  atualizadoEm: string;
  descricaoAtendimento: string;
  observacao: string;
  modoAtendimento: "compra" | "venda";
  origemAtendimento: "whatsapp" | "instagram" | "facebook" | "olx" | "outros";
  status: STATUS_ATENDIMENTO;
  temperatura: "quente" | "morno" | "frio";
  titulo: string;
  responsaveis: {
    idColaborador: string;
    nome: string;
    avatarUrl?: string;
    cargos: string;
    idUsuario: string;
  }[];
  comentarios: any[];
  chats: {
    id: string;
    canal: string;
  }[];
}

interface ClienteAtentimentoItemListType {
  nome: string;
  email: string;
  telefone?: string;
  avatar?: string;
}

interface ResponsavelAtentimentoItemListType {
  id: string;
  nome: string;
  whatsapp?: string;
  idUsuario: string;
}
