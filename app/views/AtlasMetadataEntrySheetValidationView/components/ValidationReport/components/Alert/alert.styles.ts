import { Dot } from "@databiosphere/findable-ui/lib/components/common/Dot/dot";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { textBody400 } from "@databiosphere/findable-ui/lib/styles/common/mixins/fonts";
import styled from "@emotion/styled";
import { Alert } from "@mui/material";

export const StyledAlert = styled(Alert)`
  align-items: center;
  cursor: pointer;
  gap: 24px;
  padding: 12px 16px;

  .MuiAlert-message {
    ${textBody400};
    align-items: center;
    flex: 1;
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
