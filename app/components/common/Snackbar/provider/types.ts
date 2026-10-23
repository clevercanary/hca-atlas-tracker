import { type ReactNode } from "react";
import { type SNACKBAR_SEVERITY } from "./constants";

/**
 * What every entry on the app-level stack carries.
 *
 * `open` is separate from membership in the list because a dismissed entry has
 * to stay mounted for its exit transition. `onExited` removes it.
 */
interface BaseSnackbarEntry {
  id: string;
  message: string;
  open: boolean;
}

/**
 * One error on the stack.
 *
 * `operationKey` is the request that raised it; that same operation succeeding
 * is the only thing besides the close button that dismisses the entry.
 */
export interface ErrorSnackbarEntry extends BaseSnackbarEntry {
  operationKey: string;
  severity: typeof SNACKBAR_SEVERITY.ERROR;
}

export interface SnackbarActionsContextProps {
  onClose: (id: SnackbarEntry["id"]) => void;
  onDismissOperation: (
    operationKey: ErrorSnackbarEntry["operationKey"],
  ) => void;
  onExited: (id: SnackbarEntry["id"]) => void;
  onOpen: (
    message: string,
    operationKey: ErrorSnackbarEntry["operationKey"],
  ) => void;
  onOpenSuccess: (message: string) => void;
}

export type SnackbarEntry = ErrorSnackbarEntry | SuccessSnackbarEntry;

export interface SnackbarProviderProps {
  children: ReactNode;
}

export interface SnackbarStateContextProps {
  entries: SnackbarEntry[];
}

/**
 * One confirmation on the stack. Tied to no operation: it closes itself after
 * `SUCCESS_AUTO_HIDE_DURATION`, or on its close button.
 */
export interface SuccessSnackbarEntry extends BaseSnackbarEntry {
  severity: typeof SNACKBAR_SEVERITY.SUCCESS;
}
