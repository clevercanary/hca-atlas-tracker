import { type ReactNode } from "react";

export interface SnackbarContextProps {
  message: string;
  onClose: () => void;
  onOpen: (message: string) => void;
  open: boolean;
}

export interface SnackbarProviderProps {
  children: ReactNode;
}
