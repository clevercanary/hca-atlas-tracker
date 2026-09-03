import { useEffect } from "react";

/**
 * Keeps `aria-hidden` off the toast while it is showing.
 *
 * MUI's `ModalManager` marks every sibling of an opening modal `aria-hidden`,
 * and it does so by iterating `container.children` at modal-*mount* time
 * (`Modal/ModalManager.js`). That makes the damage order-dependent: a dialog
 * opening first is harmless, because `Snackbar` renders nothing while closed
 * and there is no element to mark — but a toast already pinned when a dialog
 * opens is an existing child of `body`, gets the attribute, and is silently
 * un-announced. `SnackbarContent` is `role="alert"`, which an `aria-hidden`
 * ancestor suppresses, so the error the user most needs to hear is the one
 * they don't.
 *
 * An observer rather than an `aria-hidden={false}` prop: the attribute is set
 * imperatively after React has rendered, so React never re-asserts its own
 * value.
 *
 * Worth knowing why this isn't already handled by the container claim: moving
 * the toast into a dialog changes the portal container, which remounts it into
 * a fresh element, and that element never carried the mark. So the claiming
 * dialogs are incidentally fine. This exists for every other modal — file
 * download, publication status, source study, reprocessed status — which never
 * claims, leaving a pinned toast marked with nothing to clear it.
 *
 * The callback is a microtask, so the attribute is set and then cleared rather
 * than never set. Immaterial to a screen reader, but it does mean a test has to
 * await a flush rather than assert synchronously.
 *
 * Takes the node rather than a ref, and depends on it, because the toast's DOM
 * element is not stable: changing the portal container remounts it into a fresh
 * one. A ref object never changes identity, so an effect keyed on it would go
 * on observing the element that existed when it first ran — detached after the
 * first claim or release — and would silently miss every later mark on the
 * element actually on screen.
 * @param node - The toast's root element, or null before it mounts.
 * @param open - Whether the toast is showing.
 * @returns void.
 */
export const useAriaHiddenGuard = (
  node: HTMLElement | null,
  open: boolean,
): void => {
  useEffect(() => {
    if (!open || !node) return;

    const clear = (): void => {
      if (node.getAttribute("aria-hidden") !== null)
        node.removeAttribute("aria-hidden");
    };

    // Clear what a modal opened before this effect ran already set.
    clear();

    const observer = new MutationObserver(clear);
    observer.observe(node, {
      attributeFilter: ["aria-hidden"],
      attributes: true,
    });
    return (): void => observer.disconnect();
  }, [node, open]);
};
