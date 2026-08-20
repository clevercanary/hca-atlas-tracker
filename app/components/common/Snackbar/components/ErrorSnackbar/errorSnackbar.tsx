import { SNACKBAR_PROPS } from "@/app/components/common/Snackbar/constants";
import {
  useSnackbar,
  useSnackbarState,
} from "@/app/components/common/Snackbar/provider/hook";
import { ICON_BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/iconButton";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { CloseRounded } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { type JSX } from "react";
import { StyledSnackbar } from "./errorSnackbar.styles";

export const ErrorSnackbar = (): JSX.Element => {
  const { onClose } = useSnackbar();
  const { message, open } = useSnackbarState();

  return (
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
  );
};
