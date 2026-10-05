export interface SalespersonReport {
  id: string;
  name: string;
  avatar: string;
  dataStart: string;
  totalLeads: number;
  atDeal: number;
  atRecovery: number;
  converted: number;
  rateConversion: number;
  segmentationTemperature: {
    cold: number;
    warm: number;
    hot: number;
    total: number;
  };
  dealsWellSucceeded: number;
  rateSuccess: number;
  dealsNotCompleted: number;
  rateFailure: number;
  failures: number;
  averageQualification: number;
  averageConversion: number;
  seriesHistorical: Array<{
    month: string;
    leads: number;
    conversions: number;
  }>;
  timeAverageReply: string;
  timeAverageCompletion: string;
  conversionByTemperature: {
    cold: {
      total: number;
      conversions: number;
      rate: number;
    };
    warm: {
      total: number;
      conversions: number;
      rate: number;
    };
    hot: {
      total: number;
      conversions: number;
      rate: number;
    };
  };
  timeAverageByStage: {
    preAtendimento: string;
    atendimentoInicial: string;
    visita: string;
    negotiation: string;
  };
}
