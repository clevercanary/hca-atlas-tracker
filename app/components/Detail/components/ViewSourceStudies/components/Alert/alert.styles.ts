import { Alert } from "@databiosphere/findable-ui/lib/components/common/Alert/alert";
import styled from "@emotion/styled";

export const StyledAlert = styled(Alert)`
  &.MuiAlert-root {
    grid-column: 1 / -1;

    .MuiAlertTitle-root {
      font-size: 16px;
    }
  }
`;
