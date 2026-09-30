import { ClienteTemporario } from "./cliente-temporario";
import { Mensagem } from "./mensagem";

export type Chat = {
  id: string;
  idLoja: string;
  idCliente: string | null;
  idClienteTemporario: string;
  idAtendimento: string | null;
  idDestinatarioApiExterna: string;
  idAnuncioExterno: string | null;
  ultimaMensagemClienteEm: string | null;
  canal: 'whatsapp' | 'instagram' | 'facebook' | 'olx' | 'outros';
  criadoEm: string;
  atualizadoEm: string;
  cliente: any;
  clienteTemporario: ClienteTemporario;
  mensagem: Mensagem[];
  atendimento?: {
    id: string;
    status: string;
    atendimentoResponsaveis: {
      id: string;
      colaborador: {
        idUsuario: string;
        nome: string;
      }
    }[]
  }
};
