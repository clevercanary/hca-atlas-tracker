import { VisibilityState } from "@tanstack/react-table";

export interface Meta {
  organSpecific?: VisibilityState;
  recommended?: VisibilityState;
  required?: VisibilityState;
}
