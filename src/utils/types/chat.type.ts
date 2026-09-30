  
  export interface ClienteTemporarioType {
    id: string;
    avatar: string | null;
    nome: string | null;
    email: string | null;
    whatsapp: string | null;
    canal: string;
    idContatoApiExterna: string;
    criadoEm: string;
    atualizadoEm: string;
  }
  
  export interface ChatEmListaType {
    id: string;
    idLoja: string;
    idCliente: string | null;
    idClienteTemporario: string | null;
    idAtendimento: string | null;
    idDestinatarioApiExterna: string;
    canal: string;
    criadoEm: string;
    atualizadoEm: string;
    cliente: any; // ou defina um tipo específico, caso seja necessário
    clienteTemporario?: ClienteTemporarioType;
    idAnuncioExterno: string | null;
    mensagem?: {
        conteudo: string;
        criadoEm: string;
      }[];
  }

  export interface Pessoa {
    nome: string;
    avatar: string | null;
  }
  
  export interface MensagemType {
    id: string;
    idUsuario: string | null;
    idChat: string;
    idDestinatarioApiExterna: string;
    idMensagemExterna: string | null;
    anexoMensagem: string | null;
    tipoAnexo: string | null;
    mensagemReferencia?: string | null;
    remetente: string;
    conteudo: string;
    canal: string;
    criadoEm: string;
    pessoa: Pessoa;
  }