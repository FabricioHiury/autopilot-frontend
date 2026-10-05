export type LeadTemperature = 'HOT' | 'WARM' | 'COLD' | 'UNKNOWN';
export interface LeadDossier {
  vehicleOfInterest: string | null;
  hasTradeIn: boolean | null;
  tradeInVehicle: string | null;
  paymentMethod: string | null;
  perceivedTemperature: LeadTemperature;
  mainObjection: string | null;
}
export interface CopilotInsight {
  leadDossier: LeadDossier;
  nextBestAction: string;
  quickReplies: string[];
}
export interface CopilotAnalysis {
  enabled: boolean;
  insight: CopilotInsight | null;
  analyzedAt: string | null;
}
