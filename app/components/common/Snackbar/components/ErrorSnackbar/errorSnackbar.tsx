import { SNACKBAR_PROPS } from "@/app/components/common/Snackbar/constants";
import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { ICON_BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/iconButton";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { CloseRounded } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { type JSX } from "react";
import { StyledSnackbar } from "./errorSnackbar.styles";

export const ErrorSnackbar = (): JSX.Element => {
  const snackbar = useSnackbar();

  return (
    <StyledSnackbar
      anchorOrigin={SNACKBAR_PROPS.ORIGIN.TOP_RIGHT}
      action={
        <IconButton
          onClick={snackbar.onClose}
          size={ICON_BUTTON_PROPS.SIZE.SMALL}
        >
          <CloseRounded fontSize={SVG_ICON_PROPS.FONT_SIZE.XXSMALL} />
        </IconButton>
      }
      message={snackbar.message}
      onClose={(_event, reason) => {
        if (reason === "clickaway") return;
        snackbar.onClose();
      }}
      open={snackbar.open}
    />
  );
};
