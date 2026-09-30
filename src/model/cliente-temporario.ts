export type ClienteTemporario = {
  id: string;
  avatar: string | null;
  nome: string | null;
  email: string | null;
  whatsapp: string | null;
  canal: string;
  idContatoApiExterna: string;
  criadoEm: string;
  atualizadoEm: string;
};