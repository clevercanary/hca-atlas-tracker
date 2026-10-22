import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { SHADOWS } from "@databiosphere/findable-ui/lib/styles/common/constants/shadows";
import styled from "@emotion/styled";
import { SnackbarContent } from "@mui/material";

/*
 * The findable-ui toast (Figma "Toast"): white Body/500 text on a solid fill,
 * with a 16px close icon. Each kind of entry adds its own fill.
 */
export const StyledSnackbarContent = styled(SnackbarContent)`
  border-radius: 8px;
  box-shadow: ${SHADOWS["02"]};
  color: ${PALETTE.COMMON_WHITE};
  /* MUI wraps by default, which drops the close button below a long message. */
  flex-wrap: nowrap;
  max-width: 600px;
  padding: 6px 14px;
  /* The stack container is pointer-events: none; the entries take theirs back. */
  pointer-events: auto;

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
