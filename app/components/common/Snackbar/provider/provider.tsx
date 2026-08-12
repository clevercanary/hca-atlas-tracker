import { type JSX, useCallback, useMemo, useState } from "react";
import { SnackbarContext } from "./context";
import { type SnackbarProviderProps } from "./types";

/**
 * Holds in-memory snackbar state for any UI that opts in. Exposes `open`,
 * `message`, and callbacks to descendants via `SnackbarContext`.
 * @param props - Provider props.
 * @param props.children - React children.
 * @returns Snackbar provider component.
 */
export function SnackbarProvider({
  children,
}: SnackbarProviderProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const onClose = useCallback((): void => {
    // Message is deliberately not cleared on close: MUI keeps the snackbar content mounted through its exit transition, so clearing it here would blank the toast while it animates out.
    // The next onOpen overwrites it.
    setOpen(false);
  }, []);

  const onOpen = useCallback((message: string): void => {
    setMessage(message);
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({ message, onClose, onOpen, open }),
    [message, onClose, onOpen, open],
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}
    </SnackbarContext.Provider>
  );
}
