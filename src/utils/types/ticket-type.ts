export interface ListarTicketsType {
    total: number;
    pagina: number;
    totalPaginas: number;
    tickets: TicketItemListaType[];
  }
  
  export interface TicketItemListaType {
    id: string;
    idUsuario: string;
    idLoja: string;
    titulo: string;
    assunto: string;
    mensagem: string;
    prioridade: string;
    status: string;
    tipo: string | null;
    categoria: string;
    historico: string;
    criadoEm: string;
    atualizadoEm: string;
    usuario: {
        nome: string;
      };
  }
  
  export interface HistoricoEventoTicket {
    evento: string;
    acao: string;
    usuario: {
        id: string;
        nome: string;
      };
    data: string;
  }
  export type Ticket = { id: string; idUsuario: string; idLoja: string; titulo: string; assunto: string; mensagem: string; prioridade: string; status: string; tipo: null; categoria: string; criadoEm: string; atualizadoEm: string; usuario: { id: string; nome: string }; respostas: { id: string; idTicket: string; idUsuario: string; resposta: string; criadoEm: string; atualizadoEm: string; arquivos: any[]; usuario: { id: string; nome: string } }[]; arquivos: { id: string; criadoEm: string; atualizadoEm: string; idResposta: null; idTicket: string; idArquivo: string; url: string }[]; historico: { id: string; evento: string; acao: string; idTicket: string; idUsuario: string; criadoEm: string; usuario: { id: string; nome: string } }[]; loja: { id: string; idLojista: string; idFoto: null; cnpj: string; nomeEmpresa: string; inscricaoMunicipal: null; inscricaoEstadual: null; regimeTributario: null; portalEmpresa: null; atividadePrincipal: null; descricaoAtividade: null; wppConfigurado: boolean; wppInstancia: null; criadoEm: string; atualizadoEm: string; lojista: { id: string; idUsuario: string; status: string; tokenClienteMeta: null; tokenClienteOlx: null; deviceToken: null; criadoEm: string; atualizadoEm: string; usuario: { id: string; email: string } } } }
