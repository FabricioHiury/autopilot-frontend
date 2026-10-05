export type GeneralReport = {
  period: {
    start: string;
    end: string;
  };
  rankingChannels: {
    channel: string;
    indexQualification: number;
  }[];
  viewPreSell: PresalesOverview[];
  rankingSalespeople: {
    topConversion: {
      id: string;
      name: string;
      rateConversion: number;
    }[];
    topQualification: {
      id: string;
      name: string;
      averageQualification: number;
    }[];
  };
  timeAverageReplyGeneral: string;
  timeAverageCompletionGeneral: string;
  conversionByTemperatureGeneral: {
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
  metricsVisitsPreSalespeople: PresalesVisitMetrics[];
  reportByMode: ReportByMode[];
};
export type PresalesOverview = {
  id: string;
  salesperson: string;
  avatar: string | null;
  timeInPlatform: string;
  leadsReceived: number;
  atDeal: number;
  leadsRecovered?: number;
  leadsConverted?: number;
  averageConversion?: number;
  qualified?: number;
  rateQualification?: number;
};
export type PresalesVisitMetrics = {
  preSalesperson: {
    id: string;
    name: string;
  };
  totalVisitsScheduled: number;
  visitsWellSucceeded: number;
  rateSuccessVisits: number;
};
export type ReportByMode = {
  mode: 'BUY' | 'SELL' | 'CONSIGNMENT' | 'total';
  totalDeals: number;
  dealsWellSucceeded: number;
  failures: number;
  rateSuccess: number;
  rateFailure: number;
  averageConversion: number;
  averageQualification: number;
  segmentationStatus: {
    initial: number;
    atVisit: number;
    recovery: number;
    negotiation: number;
    total: number;
  };
  segmentationTemperature: {
    cold: {
      value: number;
      percentage: number;
    };
    warm: {
      value: number;
      percentage: number;
    };
    hot: {
      value: number;
      percentage: number;
    };
  };
  segmentacaoAposAtendimento: {
    cold: {
      value: number;
      percentage: number;
    };
    warm: {
      value: number;
      percentage: number;
    };
    hot: {
      value: number;
      percentage: number;
    };
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
  limitSuccess: number;
  rateRecovery: number;
  limitConversion: number;
  limitQualification: number;
  rateConversionLeads: number;
  rateQualification: number;
  rateConversion: number;
  limitConversionLeads: number;
  limitShowroomSuccess: number;
  limitShowroom: number;
  rateShowroom: number;
  timeAverageReplyPreSalesperson: string;
  timeAverageReplySalesperson: string;
  timeAverageFirstReply: string;
  timeAverageReplyBetweenMessages: string;
  tempoMedioRespostaVendedorPorMesTotal: string;
  segmentacaoTemperaturaQualificacaoTotal: number;
  appointmentsVisits: number;
  visitsAttended: number;
  rateAttendanceVisits: number;
  metricsVisitsGeneral: {
    totalVisitsScheduled: number;
    visitsWellSucceeded: number;
    rateSuccessVisits: number;
  };
  reasonsLoss: Reasons[];
  timeAverageReplyPreSalespersonByMonth: AverageResponseTime[];
  timeAverageReplySalespersonByMonth: AverageResponseTime[];
  dealsPreDealWithoutFollowUp: {
    id: string;
    nameDeal: string;
    period: string;
    status: string;
    employee: string;
    daysWithoutFollowUp: number;
  }[];
  dealsSalesWithoutFollowUp: {
    id: string;
    nameDeal: string;
    period: string;
    status: string;
    employee: string;
    daysWithoutFollowUp: number;
  }[];
  reasonsLossesPreDeal: Reasons[];
};
export interface Reasons {
  reason: string;
  percentage: number;
  total: number;
  subReasons: Array<{
    subReason: string;
    percentage: number;
    limit: number;
  }>;
}
export interface AverageResponseTime {
  month: string;
  timeAverage: string;
}
