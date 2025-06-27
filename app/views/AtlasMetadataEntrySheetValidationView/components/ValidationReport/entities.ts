export type EntityType = "dataset" | "donor" | "sample";

export interface ValidationErrorInfo {
  cell: string | null;
  column: string | null;
  entity_type: EntityType | null;
  input: string | Record<string, unknown> | null;
  message: string;
  primary_key: string | null;
  row: number | null;
  worksheet_id: number | null;
}
