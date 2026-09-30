export type ResumoDia = {
    data: string;
    leads: number;
    conversoes: number;
}

export type Conversao = {
    canal: string;
    nomeExibicao: string;
    valor: number
    rank?: number;
}
export type Destaque = {
    porConversas: Conversao[];
    porLeads: Conversao[];
}

export type SerieHistorica = {
    mes: string;
    leads: number;
    qualificacoes: number;
    conversoes: number;
}

export type RelatorioAtendimentoCanal = {
    canal: string;
    nomeExibicao: string;
    iconeUrl: string;
    leadsTotal: number;
    conversoes: number;
    taxaConversao: number;
    resumoDia?: ResumoDia[];
    serieHistorica?: SerieHistorica[];
}

export type RelatorioCanais = {
    canais: RelatorioAtendimentoCanal[];
    mediaConversaoGeral: number;
    totalConversoes?: number;
    totalLeads?: number;
    destaques: Destaque[];
    ranking: Ranking;
}
export type Ranking = {
    porConversas: Array<{
        canal: string;
        nomeExibicao: string;
        valor: number;
        posicao: number;
    }>;
    porLeads: Array<{
        canal: string;
        nomeExibicao: string;
        valor: number;
        posicao: number;
    }>;
}