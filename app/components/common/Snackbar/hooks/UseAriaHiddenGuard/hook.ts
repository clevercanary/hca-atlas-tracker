import { useEffect } from "react";

/**
 * Keeps `aria-hidden` off the toast's own element while it is showing.
 *
 * The toast's *own* element, precisely: the observer watches one node, with no
 * `subtree`. That is enough while the toast sits in `document.body`, which is
 * where `ariaHiddenSiblings` marks it. It is not enough once a dialog has
 * claimed the container, because the toast is then a descendant of that
 * dialog's `.MuiModal-root` and a *second* modal opening marks the root rather
 * than the toast — the observer never fires and the alert is suppressed again.
 * Unreachable with today's claiming dialogs, which contain only buttons, and
 * live the moment one gains a `Select`, `Menu`, `Popover`, `Autocomplete` or
 * nested dialog, since each of those opens a Modal. Tracked in #1568.
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
 * Why fight the mark at all, rather than accept it as ordinary modal
 * behaviour: hiding background content from assistive tech while a modal is
 * open is correct, but this toast is not background. `zIndex.snackbar` is 1400
 * against `zIndex.modal`'s 1300, with no override anywhere in the app or site
 * config, so it is deliberately painted *above* every dialog and select —
 * foreground by design. Leaving the mark in place would show a sighted user an
 * error on top of the dialog that an assistive-tech user never hears. The
 * inconsistency is the defect, not the attribute.
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
