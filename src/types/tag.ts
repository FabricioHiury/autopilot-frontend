export interface DealTag {
  id?: string;
  color: string;
  name: string;
  description: string;
}
export type TagItem = {
  id?: string;
  name: string;
  color: string;
  description?: string;
};
export type Tag = DealTag;
