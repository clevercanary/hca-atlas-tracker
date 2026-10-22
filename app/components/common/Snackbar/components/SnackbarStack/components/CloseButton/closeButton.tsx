import { getMessageId } from "@/app/components/common/Snackbar/components/SnackbarStack/utils";
import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { ICON_BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/iconButton";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { CloseRounded } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { type JSX } from "react";
import { type CloseButtonProps } from "./types";

/**
 * Closes one entry of the stack.
 *
 * Named by `label` ("Close error", "Close notification") and *described* by the
 * entry's message, so several entries are still distinguishable when tabbing or
 * listing buttons. The message is not part of the button's name: an error is
 * `role="alert"`, whose announcement is computed from the whole subtree, so a
 * name carrying the message has it read twice.
 * @param props - Component props.
 * @param props.entryId - Entry to close.
 * @param props.label - Accessible name of the button.
 * @returns close button for a snackbar entry.
 */
export const CloseButton = ({
  entryId,
  label,
}: CloseButtonProps): JSX.Element => {
  const { onClose } = useSnackbar();
  return (
    <IconButton
      aria-describedby={getMessageId(entryId)}
      aria-label={label}
      onClick={(): void => onClose(entryId)}
      size={ICON_BUTTON_PROPS.SIZE.SMALL}
    >
      <CloseRounded fontSize={SVG_ICON_PROPS.FONT_SIZE.XXSMALL} />
    </IconButton>
  );
};
