import { ErrorSnackbar } from "@/app/components/common/Snackbar/components/ErrorSnackbar/errorSnackbar";
import { type JSX, useCallback, useMemo, useState } from "react";
import { SnackbarActionsContext, SnackbarStateContext } from "./context";
import { type SnackbarEntry, type SnackbarProviderProps } from "./types";
import {
  closeEntry,
  closeOperation,
  createEntry,
  openEntry,
  removeEntry,
} from "./utils";

/**
 * Holds the snackbar entries and renders the `ErrorSnackbar` stack. Mounted
 * once in `_app`, so every page has snackbar access without opting in.
 *
 * One entry per error: `onOpen` adds one (see `openEntry` for how a repeat of
 * an operation already showing is folded in), `onClose` closes one by id,
 * `onDismissOperation` closes the entry one operation raised, and `onExited`
 * drops an entry once its exit transition has run.
 * @param props - Provider props.
 * @param props.children - React children.
 * @returns Snackbar provider component.
 */
export function SnackbarProvider({
  children,
}: SnackbarProviderProps): JSX.Element {
  const [entries, setEntries] = useState<SnackbarEntry[]>([]);

  const onClose = useCallback((id: SnackbarEntry["id"]): void => {
    setEntries((entries) => closeEntry(entries, id));
  }, []);

  const onDismissOperation = useCallback(
    (operationKey: SnackbarEntry["operationKey"]): void => {
      setEntries((entries) => closeOperation(entries, operationKey));
    },
    [],
  );

  const onExited = useCallback((id: SnackbarEntry["id"]): void => {
    setEntries((entries) => removeEntry(entries, id));
  }, []);

  const onOpen = useCallback(
    (message: string, operationKey: SnackbarEntry["operationKey"]): void => {
      // Built outside the updater, which keeps `openEntry` pure: the id is the
      // React key, so minting it per invocation would remount the entry and
      // replay the grow-in whenever React re-ran the updater.
      const entry = createEntry(message, operationKey);
      setEntries((entries) => openEntry(entries, entry));
    },
    [],
  );

  const actions = useMemo(
    () => ({ onClose, onDismissOperation, onExited, onOpen }),
    [onClose, onDismissOperation, onExited, onOpen],
  );

  const state = useMemo(() => ({ entries }), [entries]);

  return (
    <SnackbarActionsContext.Provider value={actions}>
      <SnackbarStateContext.Provider value={state}>
        {children}
        <ErrorSnackbar />
      </SnackbarStateContext.Provider>
    </SnackbarActionsContext.Provider>
  );
}
