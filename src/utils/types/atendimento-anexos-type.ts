export interface AtendimentoAnexosType {
    idAnexo: string,
    url: string,
    nome: string,
    tipo: string,
    data: string,
    nomeOriginal?: string,
}

export interface AtendimentoAnexosListarType {
    anexos: AtendimentoAnexosType[],
    pagina: number,
    itensPorPagina: number,
    totalPaginas: number,
}

export interface AtentimentoAnexosChatType {
    id: string;
    idChat: string;
    anexoMensagem: string;
    tipoAnexo: string;
    canal: string;
    criadoEm: Date;
}