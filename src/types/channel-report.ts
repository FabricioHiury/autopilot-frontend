export type DaySummary = {
  data: string;
  leads: number;
  conversions: number;
};
export type Conversion = {
  channel: string;
  nameDisplay: string;
  value: number;
  rank?: number;
};
export type Highlight = {
  byConversations: Conversion[];
  byLeads: Conversion[];
};
export type HistoricalSeries = {
  month: string;
  leads: number;
  qualifications: number;
  conversions: number;
};
export type ChannelReport = {
  channel: string;
  nameDisplay: string;
  iconUrl: string;
  leadsTotal: number;
  conversions: number;
  rateConversion: number;
  summaryDay?: DaySummary[];
  seriesHistorical?: HistoricalSeries[];
};
export type ChannelReports = {
  channels: ChannelReport[];
  averageConversionGeneral: number;
  totalConversions?: number;
  totalLeads?: number;
  highlights: Highlight[];
  ranking: Ranking;
};
export type Ranking = {
  byConversations: Array<{
    channel: string;
    nameDisplay: string;
    value: number;
    position: number;
  }>;
  byLeads: Array<{
    channel: string;
    nameDisplay: string;
    value: number;
    position: number;
  }>;
};
