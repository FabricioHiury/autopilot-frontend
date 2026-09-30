export interface RelatorioVendedor {
  id: string;
  nome: string;
  avatar: string;
  dataInicio: string;
  totalLeads: number;
  emAtendimento: number;
  emResgate: number;
  convertidos: number;
  taxaConversao: number;
  segmentacaoTemperatura: {
    frio: number;
    morno: number;
    quente: number;
    total: number;
  };
  atendimentosBemSucedidos: number;
  taxaSucesso: number;
  atendimentosNaoConcluidos: number;
  taxaInsucesso: number;
  insucessos: number;
  mediaQualificacao: number;
  mediaConversao: number;
  serieHistorica: Array<{
    mes: string;
    leads: number;
    conversoes: number;
  }>;
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
  tempoMedioPorEtapa: {
    preAtendimento: string;
    atendimentoInicial: string;
    visita: string;
    negociacao: string;
  };
}
