import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import { bpDownSm } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";
import { Alert } from "@mui/material";

export const StyledAlert = styled(Alert)`
  display: grid;
  gap: 16px 0;
  grid-template-columns: auto 1fr;

  .MuiAlert-icon {
    position: relative;
    top: 2px;
  }

  .MuiAlert-message {
    font: ${FONT.BODY_400_2_LINES};

    .MuiAlertTitle-root {
      font-size: 16px;
      line-height: 24px;
    }
  }

  .MuiAlert-action {
    grid-column: 2;
    margin: 0;
    padding: 0;

    a {
      background-color: transparent;
      padding: 10px 16px;
    }
  }

  ${bpDownSm} {
    margin: 0 16px;
  }
`;
