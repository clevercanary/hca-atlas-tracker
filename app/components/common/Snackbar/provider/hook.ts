import { useContext } from "react";
import { SnackbarActionsContext, SnackbarStateContext } from "./context";
import {
  type SnackbarActionsContextProps,
  type SnackbarStateContextProps,
} from "./types";

/**
 * Returns the snackbar actions: open an entry, close one by id, dismiss the
 * entry an operation raised, and drop one that has finished its exit. The value
 * is identity-stable.
 * @returns snackbar actions context.
 * @throws Error - When used outside a `SnackbarProvider`.
 */
export const useSnackbar = (): SnackbarActionsContextProps => {
  const context = useContext(SnackbarActionsContext);

  if (!context)
    throw new Error("useSnackbar must be used within a SnackbarProvider");

  return context;
};

/**
 * Returns the entries on the stack. Volatile, so a consumer re-renders whenever
 * one is added or removed.
 * @returns snackbar state context.
 * @throws Error - When used outside a `SnackbarProvider`.
 */
export const useSnackbarState = (): SnackbarStateContextProps => {
  const context = useContext(SnackbarStateContext);

  if (!context)
    throw new Error("useSnackbarState must be used within a SnackbarProvider");

  return context;
};
