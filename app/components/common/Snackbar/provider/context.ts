import { createContext } from "react";
import {
  type SnackbarActionsContextProps,
  type SnackbarStateContextProps,
} from "./types";

/**
 * Snackbar contexts for any UI surface that opts in via `SnackbarProvider`.
 * The context is split so mutation hooks subscribe only to the stable
 * actions, and opening/closing the snackbar re-renders only the state
 * consumer (the snackbar itself), not everything that can trigger it.
 * Both default to undefined so a consumer rendered without a provider fails
 * loud in the hooks instead of silently routing messages to a no-op.
 */
export const SnackbarActionsContext = createContext<
  SnackbarActionsContextProps | undefined
>(undefined);

export const SnackbarStateContext = createContext<
  SnackbarStateContextProps | undefined
>(undefined);
