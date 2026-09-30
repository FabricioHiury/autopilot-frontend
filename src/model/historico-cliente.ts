export interface HistoricoCliente {
  pesquisa: string;
  idCliente: string;
  idClienteTemporario: string | null;
  pagina: number;
  itensPagina: number;
  totalItens: number;
  totalPaginas: number;
  atendimentos: Atendimento[];
}

interface Atendimento {
  id: string;
  titulo: string;
  descricaoAtendimento: string;
  status: 'ABERTO' | string;
  modoAtendimento: 'ONLINE' | string;
  origemAtendimento: 'CHAT' | string;
  temperatura: 'QUENTE' | string;
  criadoEm: string;
  atualizadoEm: string | null;
  cliente: Cliente;
  responsaveis: Responsavel[];
  tags: Tag[];
  contadores: Contadores;
}

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  urlAvatar: string;
  tipo: string;
}

interface Responsavel {
  id: string;
  nome: string;
  urlAvatar: string;
}

interface Tag {
  id: string;
  nome: string;
  cor: string;
}

interface Contadores {
  comentarios: number;
  anexos: number;
}
