export interface SalespersonDetailReport {
  salesperson: {
    id: string;
    name: string;
  };
  period: {
    start: string;
    end: string;
  };
  totalLeads: number;
  totalConversions: number;
  averageConversionGeneral: number;
  percentageConversion: number;
  dealsWellSucceeded: number;
  numberConversionOnline: number;
  numberConversionShowroom: number;
  rateSuccess: number;
  rateFailure: number;
  failures: number;
  totalSalesGenerated: number;
  chartLeadsByChannel: Array<{
    channel: string;
    leads: number;
    qualified: number;
  }>;
  averageQualification: number;
  averageConversion: number;
  segmentationStatus: {
    initial: number;
    atVisit: number;
    recovery: number;
    negotiation: number;
    total: number;
  };
  segmentationTemperature: {
    cold: number;
    warm: number;
    hot: number;
  };
  rateConversionShowroom: number;
  timeAverageReply: string;
  timeAverageCompletion: string;
  rateConversionOnline: number;
  totalOnline: number;
  totalShowroom: number;
  rankingMonthly: Array<{
    month: string;
    conversions: number;
    position: number;
  }>;
  salesDailyBySalesperson: DailySalespersonSales;
  leadsVsConversionsSalesperson: {
    leads: number;
    conversions: number;
    name: string;
  }[];
  timeAverageClosing: string;
  timeAverageByStage?: {
    'Pré-atendimento': string;
    'Atendimento Inicial': string;
    Visita: string;
    'Em Negociação': string;
    Resgate: string;
    etapaMaisRapida: string;
    etapaMaisLenta: string;
  };
  reasonsLossesBusiness: {
    priceHigh: {
      value: number;
      percentage: number;
    };
    competition: {
      value: number;
      percentage: number;
    };
    notQualified: {
      value: number;
      percentage: number;
    };
    timing: {
      value: number;
      percentage: number;
    };
    other: {
      value: number;
      percentage: number;
    };
    totalLosses: number;
    primaryReason: string;
    rateLoss: number;
    reasonsDetailed: Array<{
      reason: string;
      limit: number;
      percentage: number;
    }>;
    subReasonsByReason: Record<
      string,
      Array<{
        subReason: string;
        limit: number;
        percentage: number;
      }>
    >;
    subReasonsDetailed: Array<{
      reasonPrimary: string;
      subReason: string;
      limit: number;
      percentage: number;
    }>;
  };
  segmentationTemperatureQualification: {
    cold: {
      initial: number;
      final: number;
      percentageInitial: number;
      percentageFinal: number;
    };
    warm: {
      initial: number;
      final: number;
      percentageInitial: number;
      percentageFinal: number;
    };
    hot: {
      initial: number;
      final: number;
      percentageInitial: number;
      percentageFinal: number;
    };
    total: number;
  };
  seriesHistorical: Array<{
    data: string;
    leads: number;
    conversions: number;
  }>;
}
export type SalespersonDetailResponse = SalespersonDetailReport | SalespersonDetailReport[];
export type DailySalespersonSales = Array<{
  id: string;
  name: string;
  seriesSales: Array<{
    data: string;
    sales: number;
  }>;
}>;
export interface ConsolidatedSalespersonReport {
  mode: string;
  totalConversions: number;
  totalLeads: number;
  totalOnline: number;
  rateConversionOnline: number;
  rateConversionShowroom: number;
  totalShowroom: number;
  salespeople: Array<{
    id: string;
    name: string;
    dealsWellSucceeded: number;
    dealsNotCompleted: number;
    conversionByTemperature: {
      cold: {
        leads: number;
        conversions: number;
        rate: number;
      };
      warm: {
        leads: number;
        conversions: number;
        rate: number;
      };
      hot: {
        leads: number;
        conversions: number;
        rate: number;
      };
    };
    converted: number;
    dataStart: string;
    atDeal: number;
    atRecovery: number;
    failures: number;
    averageConversion: number;
    averageQualification: number;
    reasonsLossesBusiness: {
      priceHigh: {
        value: number;
        percentage: number;
      };
      competition: {
        value: number;
        percentage: number;
      };
      notQualified: {
        value: number;
        percentage: number;
      };
      timing: {
        value: number;
        percentage: number;
      };
      other: {
        value: number;
        percentage: number;
      };
      totalLosses: number;
      primaryReason: string;
      rateLoss: number;
      reasonsDetailed: Array<{
        reason: string;
        limit: number;
        percentage: number;
      }>;
      subReasonsByReason: Record<
        string,
        Array<{
          subReason: string;
          limit: number;
          percentage: number;
        }>
      >;
      subReasonsDetailed: Array<{
        reasonPrimary: string;
        subReason: string;
        limit: number;
        percentage: number;
      }>;
    };
    segmentationTemperature: {
      cold: number;
      warm: number;
      hot: number;
      total: number;
    };
    segmentationTemperatureQualification: {
      cold: {
        initial: number;
        final: number;
        percentageInitial: number;
        percentageFinal: number;
      };
      warm: {
        initial: number;
        final: number;
        percentageInitial: number;
        percentageFinal: number;
      };
      hot: {
        initial: number;
        final: number;
        percentageInitial: number;
        percentageFinal: number;
      };
      total: number;
    };
    seriesHistorical: Array<{
      data: string;
      leads: number;
      conversions: number;
    }>;
    rateConversion: number;
    rateFailure: number;
    rateSuccess: number;
    timeAverageCompletion: string;
    numberConversionOnline: number;
    numberConversionShowroom: number;
    rateConversionOnline: number;
    rateConversionShowroom: number;
    timeAverageByStage: {
      'Pré-atendimento': string;
      'Atendimento Inicial': string;
      Visita: string;
      'Em Negociação': string;
      Resgate: string;
    };
    timeAverageReply: string;
  }>;
}
