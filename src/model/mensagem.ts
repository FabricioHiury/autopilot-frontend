export type Mensagem = {
  id: string;
  idUsuario: string | null;
  idChat: string;
  idDestinatarioApiExterna: string;
  idMensagemExterna: string;
  anexoMensagem: string | null;
  tipoAnexo: string | null;
  tipo?: string | null;
  mensagemReferencia?: string | null;
  idMensagemReferenciaExt?: string | null;
  mensagemOriginal?: {
    id: string;
    conteudo: string | null;
    anexoMensagem: string | null;
    tipoAnexo: string | null;
    criadoEm: string;
    pessoa: any | null;
  } | null;
  remetente: "cliente" | "loja" | "sistema" | string;
  conteudo: string;
  canal: string;
  criadoEm: string;
  pessoa: any | null;
  lido: boolean;
};