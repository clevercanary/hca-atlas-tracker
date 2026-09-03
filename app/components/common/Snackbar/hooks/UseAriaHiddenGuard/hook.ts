import { type RefObject, useEffect } from "react";

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
 * @param ref - Ref to the toast's root element.
 * @param open - Whether the toast is showing.
 * @returns void.
 */
export const useAriaHiddenGuard = (
  ref: RefObject<HTMLElement | null>,
  open: boolean,
): void => {
  useEffect(() => {
    const node = ref.current;
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
  }, [open, ref]);
};
