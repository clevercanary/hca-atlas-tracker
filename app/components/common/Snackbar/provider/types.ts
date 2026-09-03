import { type SnackbarScope } from "@/app/components/common/Snackbar/types";
import { type ReactNode } from "react";

export interface SnackbarActionsContextProps {
  claimContainer: (node: HTMLElement) => void;
  onClose: (scope?: SnackbarScope) => void;
  onOpen: (message: string, scope: SnackbarScope) => void;
  releaseContainer: (node: HTMLElement) => void;
}

export interface SnackbarProviderProps {
  children: ReactNode;
}

export interface SnackbarStateContextProps {
  container: HTMLElement | null;
  message: string;
  open: boolean;
}
