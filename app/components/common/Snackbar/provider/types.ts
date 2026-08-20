import { type ReactNode } from "react";

export interface SnackbarActionsContextProps {
  onClose: (id?: number) => void;
  onOpen: (message: string) => number;
}

export interface SnackbarProviderProps {
  children: ReactNode;
}

export interface SnackbarStateContextProps {
  message: string;
  open: boolean;
}
