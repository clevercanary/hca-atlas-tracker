import { createContext } from "react";
import { type SnackbarContextProps } from "./types";

/**
 * Snackbar context for any UI surface that opts in via `SnackbarProvider`.
 * Defaults to undefined so a consumer rendered without a provider fails loud
 * in `useSnackbar` instead of silently routing messages to a no-op.
 */
export const SnackbarContext = createContext<SnackbarContextProps | undefined>(
  undefined,
);
