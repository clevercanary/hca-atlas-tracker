import {
  SNACKBAR_SEVERITY,
  SUCCESS_AUTO_HIDE_DURATION,
} from "@/app/components/common/Snackbar/provider/constants";
import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { ICON_BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/iconButton";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { CloseRounded } from "@mui/icons-material";
import { Grow, IconButton, useTheme } from "@mui/material";
import { type JSX } from "react";
import { useAutoHide } from "./hooks/UseAutoHide/hook";
import { StyledSnackbarContent } from "./snackbarContent.styles";
import { type SnackbarContentProps } from "./types";

/**
 * One entry on the stack, dismissable on its own.
 *
 * An error is `role="alert"` and stays until closed. A confirmation is
 * `role="status"`, announced politely, and closes itself after
 * `SUCCESS_AUTO_HIDE_DURATION` (see `useAutoHide`).
 *
 * The close button is named "Close error" or "Close notification" and
 * *described* by the entry's message, so several entries are still
 * distinguishable when tabbing or listing buttons. The message is not part of
 * the button's name: the entry is a live region, whose announcement is computed
 * from the whole subtree, so a name carrying the message has it read twice.
 * @param props - Component props.
 * @param props.entry - The entry to render.
 * @returns one entry of the snackbar stack.
 */
export const SnackbarContent = ({
  entry,
}: SnackbarContentProps): JSX.Element => {
  const { onClose, onExited } = useSnackbar();
  const { transitions } = useTheme();
  const isSuccess = entry.severity === SNACKBAR_SEVERITY.SUCCESS;
  const autoHideProps = useAutoHide(
    entry.id,
    isSuccess ? SUCCESS_AUTO_HIDE_DURATION : undefined,
  );
  const messageId = `${entry.id}-message`;
  return (
    <Grow
      in={entry.open}
      onExited={(): void => onExited(entry.id)}
      timeout={{
        enter: transitions.duration.enteringScreen,
        exit: transitions.duration.leavingScreen,
      }}
    >
      <StyledSnackbarContent
        {...autoHideProps}
        action={
          <IconButton
            aria-describedby={messageId}
            aria-label={isSuccess ? "Close notification" : "Close error"}
            onClick={(): void => onClose(entry.id)}
            size={ICON_BUTTON_PROPS.SIZE.SMALL}
          >
            <CloseRounded fontSize={SVG_ICON_PROPS.FONT_SIZE.XXSMALL} />
          </IconButton>
        }
        message={<span id={messageId}>{entry.message}</span>}
        role={isSuccess ? "status" : "alert"}
        severity={entry.severity}
      />
    </Grow>
  );
};
