export type UserProfile = 'autopilot' | 'storeOwner' | 'user';
export interface AuthCredentials {
  email: string;
  password: string;
  expoPushToken?: string;
}
export interface AuthSession {
  token: string;
  profile: UserProfile;
  name: string;
  companyName?: string;
  storeId?: string;
  id: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  profile: UserProfile;
}
