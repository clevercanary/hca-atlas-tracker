import {
  useSnackbar,
  useSnackbarState,
} from "@/app/components/common/Snackbar/provider/hook";
import { type SnackbarScope } from "@/app/components/common/Snackbar/types";
import { useEffect, useState } from "react";

/**
 * Returns a ref callback a dialog attaches to its Paper, so the error toast
 * renders inside the dialog while it is open.
 *
 * Why the toast has to move rather than sit in `document.body`: MUI's `Modal`
 * defaults `disableEnforceFocus` to false, and its `FocusTrap` enforces focus
 * by DOM *containment* — `contains(rootElement, activeElement)`, where the root
 * is the dialog's container element. Portalling the toast beside the dialog
 * therefore does nothing for tabbability; a keyboard user cannot reach the
 * close button until they Escape out of the dialog, and the toast deliberately
 * has no `autoHideDuration`. Rendering it inside the dialog's subtree puts it
 * inside the trap, so it is reachable by Tab.
 *
 * The Paper is the claim target rather than the modal root because the trap's
 * root is the dialog *container*, so only its descendants are contained. The
 * Paper is transform-free (the default dialog transition animates opacity, not
 * scale), which matters because a transformed ancestor would become the
 * containing block for the toast's `position: fixed` and move it out of the
 * viewport corner.
 *
 * Claims only while a toast owned by this dialog's own feature is showing. The
 * container is app-global, so a claim that ignores ownership pulls whatever
 * error happens to be pinned into whichever dialog opens next: a "Failed to
 * archive file" toast would be re-parented into the Publish dialog and
 * re-announced inside its `aria-modal="true"`, reading as a failure of the
 * publish the user is being asked to confirm. Both conditions are load-bearing
 * — gating on `open` alone still absorbs a foreign error, since that is exactly
 * the case where a toast *is* showing.
 *
 * Scope is the granularity available today. It cannot tell two concurrent
 * operations of the same feature apart, which is what #1564 is about.
 *
 * Keyed on the dialog's `open` rather than on the Paper unmounting, even though
 * the ref callback alone would be simpler. MUI keeps the Paper mounted through the
 * dialog's exit transition, so releasing on unmount would leave the toast
 * inside a container that is fading to `opacity: 0` — the toast would fade out
 * with the dialog and then reappear when it was finally re-parented, which is a
 * visible flicker on a toast whose whole point is to stay put. Releasing when
 * `open` flips false hands it back before the fade starts.
 * @param open - Whether the dialog is open.
 * @param scope - Feature whose errors this dialog should adopt.
 * @returns ref callback for the dialog's `PaperProps`.
 */
export const useSnackbarContainerRef = (
  open: boolean,
  scope: SnackbarScope,
): ((node: HTMLElement | null) => void) => {
  const { claimContainer, releaseContainer } = useSnackbar();
  const { open: toastOpen, scope: toastScope } = useSnackbarState();
  // State, not a ref: the claim runs in an effect, which has to re-run when the
  // Paper mounts. A ref assignment wouldn't re-render to trigger it.
  const [node, setNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!open || !node) return;
    if (!toastOpen || toastScope !== scope) return;
    claimContainer(node);
    // Releases this node specifically, so a second dialog claiming before this
    // one tears down keeps the container.
    return (): void => releaseContainer(node);
  }, [
    claimContainer,
    node,
    open,
    releaseContainer,
    scope,
    toastOpen,
    toastScope,
  ]);

  return setNode;
};
