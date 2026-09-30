export type RelatorioGeral = {
    periodo: {
        inicio: string;
        fim: string;
    };
    rankingCanais: {
        canal: string;
        indiceQualificacao: number;
    }[];
    visaoPreVenda: VisaoPreVenda[];
    rankingVendedores: {
        topConversao: {
            id: string;
            nome: string;
            taxaConversao: number;
        }[];
        topQualificacao: {
            id: string;
            nome: string;
            mediaQualificacao: number;
        }[];
    };
    tempoMedioRespostaGeral: string;
    tempoMedioFinalizacaoGeral: string;
    conversaoPorTemperaturaGeral: {
        frio: {
            total: number;
            conversoes: number;
            taxa: number;
        };
        morno: {
            total: number;
            conversoes: number;
            taxa: number;
        };
        quente: {
            total: number;
            conversoes: number;
            taxa: number;
        };
    };
    metricasVisitasPreVendedores: MetricasVisitarPreVendedores[];
    relatorioPorModo: RelatorioPorModo[];
}

export type VisaoPreVenda = {
    id: string;
    vendedor: string;
    avatar: string | null;
    tempoNaPlataforma: string;
    leadsRecebidos: number;
    emAtendimento: number;
    leadsResgatados?: number;
    leadsConvertidos?: number;
    mediaConversao?: number;
    qualificados?: number;
    taxaQualificacao?: number;
}

export type MetricasVisitarPreVendedores = {
    preVendedor: {
        id: string;
        nome: string;
    };
    totalVisitasAgendadas: number;
    visitasBemSucedidas: number;
    taxaSucessoVisitas: number;
}

export type RelatorioPorModo = {
    modo: "compra" | "venda" | "consignado" | "total";
    totalAtendimentos: number;
    atendimentosBemSucedidos: number;
    insucessos: number;
    taxaSucesso: number;
    taxaInsucesso: number;
    mediaConversao: number;
    mediaQualificacao: number;
    segmentacaoStatus: {
        inicial: number;
        emVisita: number;
        resgate: number;
        negociacao: number;
        total: number;
    };
    segmentacaoTemperatura: {
        frio: {
            valor: number;
            porcentagem: number;
        };
        morno: {
            valor: number;
            porcentagem: number;
        };
        quente: {
            valor: number;
            porcentagem: number;
        };
    };
    segmentacaoAposAtendimento: {
        frio: {
            valor: number;
            porcentagem: number;
        };
        morno: {
            valor: number;
            porcentagem: number;
        };
        quente: {
            valor: number;
            porcentagem: number;
        };
        total: number;
    };
    segmentacaoTemperaturaQualificacao: {
        frio: {
            inicial: number;
            final: number;
            porcentagemInicial: number;
            porcentagemFinal: number;
        };
        morno: {
            inicial: number;
            final: number;
            porcentagemInicial: number;
            porcentagemFinal: number;
        };
        quente: {
            inicial: number;
            final: number;
            porcentagemInicial: number;
            porcentagemFinal: number;
        };
        total: number;
    };
    tempoMedioResposta: string;
    tempoMedioFinalizacao: string;
    conversaoPorTemperatura: {
        frio: {
            total: number;
            conversoes: number;
            taxa: number;
        };
        morno: {
            total: number;
            conversoes: number;
            taxa: number;
        };
        quente: {
            total: number;
            conversoes: number;
            taxa: number;
        };
    };
    quantidadeSucesso: number;
    taxaResgate: number;
    quantidadeConversao: number;
    quantidadeQualificacao: number;
    taxaConversaoLeads: number;
    taxaQualificacao: number;
    taxaConversao: number;
    quantidadeConversaoLeads: number;
    quantidadeShowroomSucesso: number;
    quantidadeShowroom: number;
    taxaShowroom: number;
    tempoMedioRespostaPreVendedor: string;
    tempoMedioRespostaVendedor: string;
    tempoMedioPrimeiraResposta: string;
    tempoMedioRespostaEntreMensagens: string;
    tempoMedioRespostaVendedorPorMesTotal: string;
    segmentacaoTemperaturaQualificacaoTotal: number;
    agendamentosVisitas: number;
    visitasCompareceram: number;
    taxaComparecimentoVisitas: number;
    metricasVisitasGeral: {
        "totalVisitasAgendadas": number;
        "visitasBemSucedidas": number;
        "taxaSucessoVisitas": number;
    },
    motivosPerda: Motivos[];
    tempoMedioRespostaPreVendedorPorMes: TempoMedioReposta[];
    tempoMedioRespostaVendedorPorMes: TempoMedioReposta[];
      atendimentosPreAtendimentoSemFollowUp: {
        id: string;
        nomeAtendimento: string;
        periodo: string;
        status: string;
        colaborador: string;
        diasSemFollowUp: number;
    }[];
    atendimentosVendasSemFollowUp: {
        id: string;
        nomeAtendimento: string;
        periodo: string;
        status: string;
        colaborador: string;
        diasSemFollowUp: number;
    }[];
    motivosPerdasPreAtendimento: Motivos[];
}

export interface Motivos {
    motivo: string;
    porcentagem: number;
    total: number;
    submotivos: Array<{
        submotivo: string;
        porcentagem: number;
        quantidade: number;
    }>
}

export interface TempoMedioReposta {
    mes: string;
    tempoMedio: string;
}