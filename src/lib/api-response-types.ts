export interface ApiResponseLoginType {
    token: string;
    perfil: string;
    nome: string;
    id: string;
    idLoja: string;
    nomeEmpresa: string;
}

export interface ColaboradorType {
    id: string;
    idLoja: string;
    idUsuario: string;
    idFoto: string;
    nome: string;
    documentoFiscal: string;
    status: string;
    observacoes: string;
    telefoneComplementar: string;
    whatsapp: string;
    email: string;
    cargos: Cargo[]
    criadoEm: string;
    atualizadoEm: string;
}

type Cargo={
    cargo:string;
    funcionalidades:string;
    id: string;
    idLoja: string
}

export interface ComentarioType {
    id: string;
    idAtendimento: string;
    idUsuario: string;
    nome: string;
    avatar: string;
    criadoEm: Date;
    comentario: string;
}

export interface ComentarioListType {
    pagina: number;
    itensPagina: number;
    comentarios: ComentarioType[];
}