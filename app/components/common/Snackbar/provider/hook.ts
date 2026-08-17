import { useContext } from "react";
import { SnackbarActionsContext, SnackbarStateContext } from "./context";
import {
  type SnackbarActionsContextProps,
  type SnackbarStateContextProps,
} from "./types";

/**
 * Returns the snackbar actions (open/close). The value is identity-stable, so
 * consumers (e.g. mutation hooks) don't re-render when the snackbar opens or
 * closes.
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
 * Returns the snackbar state (message/open). Volatile — changes on every
 * open/close — so it's consumed only by the snackbar rendering it.
 * @returns snackbar state context.
 * @throws Error - When used outside a `SnackbarProvider`.
 */
export const useSnackbarState = (): SnackbarStateContextProps => {
  const context = useContext(SnackbarStateContext);

  if (!context)
    throw new Error("useSnackbarState must be used within a SnackbarProvider");

  return context;
};
