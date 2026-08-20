import { ErrorSnackbar } from "@/app/components/common/Snackbar/components/ErrorSnackbar/errorSnackbar";
import { type JSX, useCallback, useMemo, useRef, useState } from "react";
import { SnackbarActionsContext, SnackbarStateContext } from "./context";
import { type SnackbarProviderProps } from "./types";

/**
 * Holds in-memory snackbar state and renders the `ErrorSnackbar` itself (it's
 * fixed-position, so mount location is irrelevant). Mounted once in `_app`,
 * so every page has snackbar access without opting in.
 * Actions and state are exposed via separate contexts so opening/closing the
 * snackbar re-renders only the snackbar, not action subscribers.
 * `onOpen` returns a handle identifying the message it opened; passing that
 * handle to `onClose` closes the snackbar only if that message is still the
 * one showing, so a feature dismissing its own stale error can't dismiss an
 * unread error opened by another feature in the meantime. Calling `onClose`
 * without a handle closes unconditionally (the snackbar's own close button).
 * @param props - Provider props.
 * @param props.children - React children.
 * @returns Snackbar provider component.
 */
export function SnackbarProvider({
  children,
}: SnackbarProviderProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  // Handle of the most recently opened message, for scoped closes.
  const openedIdRef = useRef(0);

  const onClose = useCallback((id?: number): void => {
    // Scoped close: a stale handle means another message has since been
    // opened — leave it showing.
    if (id !== undefined && id !== openedIdRef.current) return;
    // Message is deliberately not cleared on close: MUI keeps the snackbar content mounted through its exit transition, so clearing it here would blank the toast while it animates out.
    // The next onOpen overwrites it.
    setOpen(false);
  }, []);

  const onOpen = useCallback((message: string): number => {
    setMessage(message);
    setOpen(true);
    return ++openedIdRef.current;
  }, []);

  const actions = useMemo(() => ({ onClose, onOpen }), [onClose, onOpen]);
  const state = useMemo(() => ({ message, open }), [message, open]);

  return (
    <SnackbarActionsContext.Provider value={actions}>
      <SnackbarStateContext.Provider value={state}>
        {children}
        <ErrorSnackbar />
      </SnackbarStateContext.Provider>
    </SnackbarActionsContext.Provider>
  );
}
