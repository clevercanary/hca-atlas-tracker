import { Dot } from "@databiosphere/findable-ui/lib/components/common/Dot/dot";
import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import { Alert } from "@mui/material";

export const StyledAlert = styled(Alert)`
  align-items: center;
  border-radius: 4px;
  gap: 24px;
  padding: 4px 16px;

  .MuiAlert-message {
    align-items: center;
    flex: 1;
    font: ${FONT.BODY_400}
    gap: 4px;
    grid-auto-flow: column;
    justify-content: flex-start;

    code {
      background-color: ${PALETTE.ALERT_LIGHT};
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      padding: 0 4px;
    }
  }

  .MuiAlert-action {
    margin: 0;
    padding: 0;

    .MuiButton-text {
      color: ${PALETTE.ALERT_MAIN};
      gap: 4px;

      &:hover {
        background-color: transparent;
      }

      .MuiButton-endIcon {
        margin: 0;
      }
    }
  }
`;

export const StyledDot = styled(Dot)`
  background-color: ${PALETTE.INK_MAIN};
`;
