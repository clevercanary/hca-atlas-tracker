import { type ReactNode } from "react";

export interface SnackbarActionsContextProps {
  onClose: () => void;
  onOpen: (message: string) => void;
}

export interface SnackbarProviderProps {
  children: ReactNode;
}

export interface SnackbarStateContextProps {
  message: string;
  open: boolean;
}
