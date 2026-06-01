import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import { Alert } from "@mui/material";

export const StyledAlert = styled(Alert)`
  border-radius: 4px;
  padding: 12px 16px;

  .MuiAlert-message {
    all: unset;
    font: ${FONT.BODY_400};

    code {
      background-color: ${({ severity }) =>
        severity === "error" ? PALETTE.ALERT_LIGHT : PALETTE.WARNING_LIGHT};
      border-radius: 4px;
      font: inherit;
      font-family: "Roboto Mono", monospace;
      padding: 0 4px;
    }
  }
`;
