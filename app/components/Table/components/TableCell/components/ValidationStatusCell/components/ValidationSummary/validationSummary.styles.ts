import { ErrorIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { Stack, styled } from "@mui/material";

export const StyledStack = styled(Stack)`
  a {
    text-decoration: underline;
    text-decoration-color: currentColor;
    text-decoration-skip-ink: none;
    text-underline-position: from-font;
  }
`;

export const StyledErrorIcon = styled(ErrorIcon)`
  color: ${PALETTE.ALERT_MAIN};
`;
