import { RouteValue } from "../../../routes/entities";
import { UseFormManager } from "../useFormManager";

export interface FormAccess {
  canEdit: boolean;
  canView: boolean;
}

export interface FormAction {
  onCancel?: () => void;
  onDelete?: () => void;
  onDiscard?: () => void;
  onNavigate?: (path: string, route?: RouteValue) => void;
  onSave?: () => void;
}

export type FormManager = UseFormManager;

export interface FormStatus {
  isDirty: boolean;
  isDisabled: boolean;
  isLeaving: boolean;
  isReadOnly: boolean;
  isSubmitSuccessful: boolean;
  isSubmitted: boolean;
  isSubmitting: boolean;
}

export type GetNextRouteFn = () => RouteValue | undefined;
