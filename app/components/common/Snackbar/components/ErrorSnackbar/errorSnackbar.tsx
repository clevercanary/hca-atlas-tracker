import { SNACKBAR_PROPS } from "@/app/components/common/Snackbar/constants";
import {
  useSnackbar,
  useSnackbarState,
} from "@/app/components/common/Snackbar/provider/hook";
import { ICON_BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/iconButton";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { CloseRounded } from "@mui/icons-material";
import { IconButton, Portal } from "@mui/material";
import { type JSX } from "react";
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
 * revision) would then paint above the dialog yet be unannounced to screen
 * readers and untabbable behind the focus trap. Portalling puts it beside the
 * dialog rather than under the hidden subtree. Closing the dialog on failure
 * would also work, but would throw away the retry the user is most likely to
 * want.
 * @returns error snackbar component.
 */
export const ErrorSnackbar = (): JSX.Element => {
  const { onClose } = useSnackbar();
  const { message, open } = useSnackbarState();

  return (
    <Portal>
      <StyledSnackbar
        anchorOrigin={SNACKBAR_PROPS.ORIGIN.TOP_RIGHT}
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
