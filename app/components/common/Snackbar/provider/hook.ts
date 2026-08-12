import { useContext } from "react";
import { SnackbarContext } from "./context";
import { type SnackbarContextProps } from "./types";

/**
 * Returns snackbar context.
 * @returns snackbar context.
 * @throws Error - When used outside a `SnackbarProvider`.
 */
export const useSnackbar = (): SnackbarContextProps => {
  const context = useContext(SnackbarContext);

  if (!context)
    throw new Error("useSnackbar must be used within a SnackbarProvider");

  return context;
};
