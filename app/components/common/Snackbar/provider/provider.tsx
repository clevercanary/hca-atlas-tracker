import { ErrorSnackbar } from "@/app/components/common/Snackbar/components/ErrorSnackbar/errorSnackbar";
import { type SnackbarScope } from "@/app/components/common/Snackbar/types";
import { type JSX, useCallback, useMemo, useRef, useState } from "react";
import { SnackbarActionsContext, SnackbarStateContext } from "./context";
import { type SnackbarProviderProps } from "./types";

/**
 * Holds in-memory snackbar state and renders the `ErrorSnackbar` itself (it's
 * fixed-position, so mount location is irrelevant). Mounted once in `_app`,
 * so every page has snackbar access without opting in.
 * Actions and state are exposed via separate contexts so opening/closing the
 * snackbar re-renders only the snackbar, not action subscribers.
 * `onOpen` records the scope that opened the message; passing that scope to
 * `onClose` closes the snackbar only if that scope's message is still the one
 * showing, so a feature dismissing its own stale error can't dismiss an unread
 * error opened by another feature in the meantime. Ownership is tracked here
 * rather than in the calling hook because this provider outlives page
 * navigation while its consumers don't. Calling `onClose` without a scope
 * closes unconditionally (the snackbar's own close button).
 * @param props - Provider props.
 * @param props.children - React children.
 * @returns Snackbar provider component.
 */
export function SnackbarProvider({
  children,
}: SnackbarProviderProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  // Element the toast renders into, when a dialog has claimed it; null means
  // `document.body`. See `useSnackbarContainerRef` for why a dialog claims it.
  const [container, setContainer] = useState<HTMLElement | null>(null);
  // Scope that opened the message currently showing. Held in a ref for scoped
  // closes (which must not re-render action subscribers) and mirrored into
  // state so a dialog can tell whether the showing error is its own before
  // claiming the container — see `useSnackbarContainerRef`.
  const openedScopeRef = useRef<SnackbarScope | undefined>(undefined);
  const [scope, setScope] = useState<SnackbarScope | undefined>(undefined);

  const onClose = useCallback((scope?: SnackbarScope): void => {
    // Scoped close: another feature's message has since replaced this scope's
    // — leave it showing.
    if (scope !== undefined && scope !== openedScopeRef.current) return;
    // Message is deliberately not cleared on close: MUI keeps the snackbar content mounted through its exit transition, so clearing it here would blank the toast while it animates out.
    // The next onOpen overwrites it.
    setOpen(false);
  }, []);

  const claimContainer = useCallback((node: HTMLElement): void => {
    setContainer(node);
  }, []);

  const releaseContainer = useCallback((node: HTMLElement): void => {
    // Only clear if this node is still the one showing. A dialog's exit
    // transition can unmount it after a second dialog has already claimed the
    // container, and the later claim must win.
    setContainer((current) => (current === node ? null : current));
  }, []);

  const onOpen = useCallback((message: string, scope: SnackbarScope): void => {
    setMessage(message);
    setOpen(true);
    setScope(scope);
    openedScopeRef.current = scope;
  }, []);

  const actions = useMemo(
    () => ({ claimContainer, onClose, onOpen, releaseContainer }),
    [claimContainer, onClose, onOpen, releaseContainer],
  );
  const state = useMemo(
    () => ({ container, message, open, scope }),
    [container, message, open, scope],
  );

  return (
    <SnackbarActionsContext.Provider value={actions}>
      <SnackbarStateContext.Provider value={state}>
        {children}
        <ErrorSnackbar />
      </SnackbarStateContext.Provider>
    </SnackbarActionsContext.Provider>
  );
}
