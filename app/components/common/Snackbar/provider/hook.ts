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
 * Returns the snackbar state (message, open, scope, container). Volatile —
 * changes on every open and close — so a consumer re-renders with the snackbar.
 *
 * `ErrorSnackbar` is the main consumer, but no longer the only one:
 * `useSnackbarContainerRef` reads `open` and `scope` so a dialog can tell
 * whether the showing error is its own before claiming the container (#1563).
 * That puts the two claiming dialogs, and their whole Modal subtrees, on this
 * context — they re-render on every snackbar change, not just their own. Cheap
 * today because both hold only buttons, and it goes away with the claim itself
 * (#1569). Weigh that before adding a third consumer.
 * @returns snackbar state context.
 * @throws Error - When used outside a `SnackbarProvider`.
 */
export const useSnackbarState = (): SnackbarStateContextProps => {
  const context = useContext(SnackbarStateContext);

  if (!context)
    throw new Error("useSnackbarState must be used within a SnackbarProvider");

  return context;
};
