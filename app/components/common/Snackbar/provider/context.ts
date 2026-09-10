import { createContext } from "react";
import {
  type SnackbarActionsContextProps,
  type SnackbarStateContextProps,
} from "./types";

/**
 * Snackbar contexts, provided app-wide by the `SnackbarProvider` mounted in
 * `_app`. Split so consumers can subscribe to the stable actions without
 * re-rendering when an entry is added or removed. Both default to undefined so
 * a consumer rendered without a provider fails loud in the hooks.
 */
export const SnackbarActionsContext = createContext<
  SnackbarActionsContextProps | undefined
>(undefined);

export const SnackbarStateContext = createContext<
  SnackbarStateContextProps | undefined
>(undefined);
