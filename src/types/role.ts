export interface Role {
  id: string | null;
  role: string;
  features: string[];
}
export interface RoleDetails extends Role {
  id: string;
}
