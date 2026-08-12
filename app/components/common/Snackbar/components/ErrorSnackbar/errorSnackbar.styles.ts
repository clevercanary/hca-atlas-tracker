import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { SHADOWS } from "@databiosphere/findable-ui/lib/styles/common/constants/shadows";
import styled from "@emotion/styled";
import { Snackbar } from "@mui/material";

export const StyledSnackbar = styled(Snackbar)`
  .MuiSnackbarContent-root {
    background-color: ${PALETTE.ALERT_MAIN};
    box-shadow: ${SHADOWS["02"]};
    border-radius: 8px;
    color: ${PALETTE.COMMON_WHITE};
    max-width: 600px;
    padding: 6px 14px;
  }

  .MuiSnackbarContent-message {
    -webkit-box-orient: vertical;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    font: ${FONT.BODY_500};
    margin: 6px 0;
    min-width: 0;
    overflow: hidden;
    overflow-wrap: break-word;
    padding: 0;
  }

  .MuiSnackbarContent-action {
    margin-right: -8px;
    padding-left: 10px;

    .MuiIconButton-root {
      color: ${PALETTE.COMMON_WHITE};
    }
  }
`;
