import { SNACKBAR_PROPS } from "@/app/components/common/Snackbar/constants";
import { useAriaHiddenGuard } from "@/app/components/common/Snackbar/hooks/UseAriaHiddenGuard/hook";
import {
  useSnackbar,
  useSnackbarState,
} from "@/app/components/common/Snackbar/provider/hook";
import { ICON_BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/iconButton";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { CloseRounded } from "@mui/icons-material";
import { IconButton, Portal, useTheme } from "@mui/material";
import { type JSX, useState } from "react";
import { StyledSnackbar } from "./errorSnackbar.styles";

/**
 * App-level error toast. Deliberately has no `autoHideDuration`: per design,
 * an error must be dismissed by the user — either via the close button here,
 * or by the owning feature's next success clearing its own stale error (see
 * `useErrorSnackbar`). Don't add an auto-hide to stop an error pinning; the
 * pinning is the point.
 *
 * Portalled to `document.body`. MUI's `Snackbar` renders in place, which would
 * put it inside `#__next` — and an open `Dialog` portals to `body` and has its
 * `ModalManager` mark every sibling of the modal `aria-hidden`, `#__next`
 * included. A toast raised by a failure inside a dialog (publish, create
 * revision) would then paint above the dialog yet go unannounced, since
 * `SnackbarContent` is `role="alert"` and an `aria-hidden` ancestor suppresses
 * it. Portalling puts the toast beside the dialog rather than under the hidden
 * subtree. Closing the dialog on failure would also work, but would throw away
 * the retry the user is most likely to want.
 *
 * The two a11y gaps portalling alone left open (#1563) are closed by the two
 * mechanisms below, because portalling addressed neither:
 * - Tabbability, by `useSnackbarContainerRef`. A dialog claims the container so
 *   the toast renders inside it, and is therefore inside the focus trap — which
 *   enforces by DOM containment, so tree position beside the dialog never
 *   helped.
 * - Announcement, by `useAriaHiddenGuard`. Changing the portal container
 *   remounts the toast into a fresh element, so a claiming dialog clears
 *   `ariaHiddenSiblings`' mark as a side effect — but most of this app's
 *   dialogs never claim, and for those nothing else removes it. The guard
 *   covers them, which is what makes the announcement fix hold for more than
 *   these two dialogs. It covers marks on the toast itself, not on an ancestor
 *   once claimed; see the hook and #1568 for the gap that leaves.
 * @returns error snackbar component.
 */
export const ErrorSnackbar = (): JSX.Element => {
  const theme = useTheme();
  const { onClose } = useSnackbar();
  const { container, message, open } = useSnackbarState();
  // State via a callback ref, not `useRef`: the toast is remounted into a fresh
  // element whenever the portal container changes, and the guard has to follow
  // it. A ref would hold the first element forever.
  const [snackbarNode, setSnackbarNode] = useState<HTMLDivElement | null>(null);

  useAriaHiddenGuard(snackbarNode, open);

  return (
    <Portal container={container ?? undefined}>
      <StyledSnackbar
        anchorOrigin={SNACKBAR_PROPS.ORIGIN.TOP_RIGHT}
        ref={setSnackbarNode}
        // Zero-length *appear*, full-length enter and exit. Changing the
        // portal container remounts this subtree, so every claim and release
        // would replay MUI's `Grow` — the toast popping out and growing back in
        // on each dialog open and close.
        //
        // Suppressed by duration rather than `appear: false`, which looks
        // equivalent and is not: `Snackbar` renders nothing while
        // `!open && exited`, so every open is an *appear*, and `appear: false`
        // starts the transition at `ENTERED` so `onEnter` never fires and
        // `exited` never flips. On close `!open && exited` is then immediately
        // true and the node is dropped synchronously, losing the exit fade on
        // every toast on every page. A zero duration still runs the transition.
        //
        // Two knock-ons: a toast's first appearance is instant, and the remount
        // still recreates the `role="alert"` node, so a claim or release
        // re-announces regardless of the transition. Both go away with the
        // claim itself (#1569).
        transitionDuration={{
          appear: 0,
          enter: theme.transitions.duration.enteringScreen,
          exit: theme.transitions.duration.leavingScreen,
        }}
        action={
          <IconButton
            aria-label="Close error message"
            onClick={(): void => onClose()}
            size={ICON_BUTTON_PROPS.SIZE.SMALL}
          >
            <CloseRounded fontSize={SVG_ICON_PROPS.FONT_SIZE.XXSMALL} />
          </IconButton>
        }
        message={message}
        onClose={(_event, reason) => {
          if (reason === "clickaway") return;
          onClose();
        }}
        open={open}
      />
    </Portal>
  );
};
