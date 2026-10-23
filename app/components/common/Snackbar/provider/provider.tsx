import { SnackbarStack } from "@/app/components/common/Snackbar/components/SnackbarStack/snackbarStack";
import { type JSX, useCallback, useMemo, useState } from "react";
import { SnackbarActionsContext, SnackbarStateContext } from "./context";
import {
  type ErrorSnackbarEntry,
  type SnackbarEntry,
  type SnackbarProviderProps,
} from "./types";
import {
  closeEntry,
  closeOperation,
  createErrorEntry,
  createSuccessEntry,
  openEntry,
  removeEntry,
} from "./utils";

/**
 * Holds the snackbar entries and renders the `SnackbarStack`. Mounted once in
 * `_app`, so every page has snackbar access without opting in.
 *
 * One entry per error or confirmation: `onOpen` adds an error (see `openEntry`
 * for how a repeat of an operation already showing is folded in),
 * `onOpenSuccess` adds a confirmation, `onClose` closes one by id,
 * `onDismissOperation` closes the error one operation raised, and `onExited`
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
    (operationKey: ErrorSnackbarEntry["operationKey"]): void => {
      setEntries((entries) => closeOperation(entries, operationKey));
    },
    [],
  );

  const onExited = useCallback((id: SnackbarEntry["id"]): void => {
    setEntries((entries) => removeEntry(entries, id));
  }, []);

  const onOpen = useCallback(
    (
      message: string,
      operationKey: ErrorSnackbarEntry["operationKey"],
    ): void => {
      // Built outside the updater, which keeps `openEntry` pure: the id is the
      // React key, so minting it per invocation would remount the entry and
      // replay the grow-in whenever React re-ran the updater.
      const entry = createErrorEntry(message, operationKey);
      setEntries((entries) => openEntry(entries, entry));
    },
    [],
  );

  const onOpenSuccess = useCallback((message: string): void => {
    // Built outside the updater for the same reason as in `onOpen`. A
    // confirmation belongs to no operation, so it is always appended.
    const entry = createSuccessEntry(message);
    setEntries((entries) => [...entries, entry]);
  }, []);

  const actions = useMemo(
    () => ({ onClose, onDismissOperation, onExited, onOpen, onOpenSuccess }),
    [onClose, onDismissOperation, onExited, onOpen, onOpenSuccess],
  );

  const state = useMemo(() => ({ entries }), [entries]);

  return (
    <SnackbarActionsContext.Provider value={actions}>
      <SnackbarStateContext.Provider value={state}>
        {children}
        <SnackbarStack />
      </SnackbarStateContext.Provider>
    </SnackbarActionsContext.Provider>
  );
}
