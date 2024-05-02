import { UseFormManager } from "../useFormManager";

export interface FormAccess {
  canEdit: boolean;
  canView: boolean;
}

export type FormManager = UseFormManager;
