import { type ReactNode } from "react";

export interface SnackbarActionsContextProps {
  onClose: (id: SnackbarEntry["id"]) => void;
  onDismissOperation: (operationKey: SnackbarEntry["operationKey"]) => void;
  onExited: (id: SnackbarEntry["id"]) => void;
  onOpen: (
    message: string,
    operationKey: SnackbarEntry["operationKey"],
  ) => void;
}

/**
 * One error on the app-level stack.
 *
 * `operationKey` is the request that raised it; that same operation succeeding
 * is the only thing besides the close button that dismisses the entry.
 *
 * `open` is separate from membership in the list because a dismissed entry has
 * to stay mounted for its exit transition. `onExited` removes it.
 */
export interface SnackbarEntry {
  id: string;
  message: string;
  open: boolean;
  operationKey: string;
}

export interface SnackbarProviderProps {
  children: ReactNode;
}

export interface SnackbarStateContextProps {
  entries: SnackbarEntry[];
}
