export interface TenantConfig {
  id: string;
  storeId: string;
  displayName: string;
  slug?: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  faviconUrl?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
  workingDays?: number[];
  commissionRules?: Record<string, number>;
}
export type UpdateTenantConfig = Partial<Omit<TenantConfig, 'id' | 'storeId'>>;
export interface Store {
  id: string;
  companyName: string;
  taxId: string;
  photoUrl?: string | null;
}
