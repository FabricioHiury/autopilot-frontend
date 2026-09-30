export interface RelatorioVendedorEspecifico {
  vendedor: {
    id: string;
    nome: string;
  };
  periodo: {
    inicio: string;
    fim: string;
  };
  totalLeads: number;
  totalConversoes: number;
  mediaConversaoGeral: number;
  percentualConversao: number;
  atendimentosBemSucedidos: number;
  numeroConversaoOnline: number;
  numeroConversaoShowroom: number;
  taxaSucesso: number;
  taxaInsucesso: number;
  insucessos: number;
  totalVendasGeradas: number;
  graficoLeadsPorCanal: Array<{
    canal: string;
    leads: number;
    qualificados: number;
  }>;
  mediaQualificacao: number;
  mediaConversao: number;
  segmentacaoStatus: {
    inicial: number;
    emVisita: number;
    resgate: number;
    negociacao: number;
    total: number;
  };
  segmentacaoTemperatura: {
    frio: number;
    morno: number;
    quente: number;
  };
  taxaConversaoShowroom: number;
  tempoMedioResposta: string;
  tempoMedioFinalizacao: string;
  taxaConversaoOnline: number;
  totalOnline: number;
  totalShowroom: number;
  rankingMensal: Array<{
    mes: string;
    conversoes: number;
    posicao: number;
  }>;
  vendasDiariasPorVendedor: VendasDiariasVendedor;
  leadsVsConversoesVendedor: {
    leads: number;
    conversoes: number;
    nome: string;
  }[],
  tempoMedioFechamento: string;
  tempoMedioPorEtapa?: {
    "Pré-atendimento": string;
    "Atendimento Inicial": string;
    "Visita": string;
    "Em Negociação": string;
    "Resgate": string;
    etapaMaisRapida: string;
    etapaMaisLenta: string;
  };
  motivosPerdasNegociais: {
    precoAlto: {
      valor: number;
      porcentagem: number;
    };
    concorrencia: {
      valor: number;
      porcentagem: number;
    };
    naoQualificado: {
      valor: number;
      porcentagem: number;
    };
    timing: {
      valor: number;
      porcentagem: number;
    };
    outros: {
      valor: number;
      porcentagem: number;
    };
    totalPerdas: number;
    principalMotivo: string;
    taxaPerda: number;
    motivosDetalhados: Array<{ motivo: string, quantidade: number, porcentagem: number }>;
    submotivosPorMotivo: Record<string, Array<{ submotivo: string; quantidade: number; porcentagem: number }>>;
    submotivosDetalhados: Array<{ motivoPrincipal: string; submotivo: string; quantidade: number; porcentagem: number }>
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
  serieHistorica: Array<{
    data: string;
    leads: number;
    conversoes: number;
  }>;
}

export type RelatorioVendedorEspecificoResponse =
  | RelatorioVendedorEspecifico
  | RelatorioVendedorEspecifico[];

export type VendasDiariasVendedor = Array<{
  id: string;
  nome: string;
  serieVendas: Array<{
    data: string;
    vendas: number;
  }>;
}>;


export interface RelatorioConsolidadoVendedores {
  modo: string;
  totalConversoes: number;
  totalLeads: number;
  totalOnline: number;
  taxaConversaoOnline: number;
  taxaConversaoShowroom: number;
  totalShowroom: number;
  vendedores: Array<{
    id: string;
    nome: string;
    atendimentosBemSucedidos: number;
    atendimentosNaoConcluidos: number;
    conversaoPorTemperatura: {
      frio: {
        leads: number;
        conversoes: number;
        taxa: number;
      };
      morno: {
        leads: number;
        conversoes: number;
        taxa: number;
      };
      quente: {
        leads: number;
        conversoes: number;
        taxa: number;
      };
    };
    convertidos: number;
    dataInicio: string;
    emAtendimento: number;
    emResgate: number;
    insucessos: number;
    mediaConversao: number;
    mediaQualificacao: number;
    motivosPerdasNegociais: {
      precoAlto: {
        valor: number;
        porcentagem: number;
      };
      concorrencia: {
        valor: number;
        porcentagem: number;
      };
      naoQualificado: {
        valor: number;
        porcentagem: number;
      };
      timing: {
        valor: number;
        porcentagem: number;
      };
      outros: {
        valor: number;
        porcentagem: number;
      };
      totalPerdas: number;
      principalMotivo: string;
      taxaPerda: number;
      motivosDetalhados: Array<{ motivo: string, quantidade: number, porcentagem: number }>;
      submotivosPorMotivo: Record<string, Array<{ submotivo: string; quantidade: number; porcentagem: number }>>;
      submotivosDetalhados: Array<{ motivoPrincipal: string; submotivo: string; quantidade: number; porcentagem: number }>
    };
    segmentacaoTemperatura: {
      frio: number;
      morno: number;
      quente: number;
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
    serieHistorica: Array<{
      data: string;
      leads: number;
      conversoes: number;
    }>;
    taxaConversao: number;
    taxaInsucesso: number;
    taxaSucesso: number;
    tempoMedioFinalizacao: string;
    numeroConversaoOnline: number;
    numeroConversaoShowroom: number;
    taxaConversaoOnline: number;
    taxaConversaoShowroom: number;
    tempoMedioPorEtapa: {
      "Pré-atendimento": string;
      "Atendimento Inicial": string;
      Visita: string;
      "Em Negociação": string;
      Resgate: string;
    };
    tempoMedioResposta: string;
  }>;
}

