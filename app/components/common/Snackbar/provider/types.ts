import { type SnackbarScope } from "@/app/components/common/Snackbar/types";
import { type ReactNode } from "react";

export interface SnackbarActionsContextProps {
  onClose: (scope?: SnackbarScope) => void;
  onOpen: (message: string, scope: SnackbarScope) => void;
}

export interface SnackbarProviderProps {
  children: ReactNode;
}

export interface SnackbarStateContextProps {
  message: string;
  open: boolean;
}
