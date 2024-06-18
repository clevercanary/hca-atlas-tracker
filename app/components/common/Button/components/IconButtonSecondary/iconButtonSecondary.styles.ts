import { Button as DXButton } from "@databiosphere/findable-ui/lib/components/common/Button/button";
import styled from "@emotion/styled";

export const Button = styled(DXButton)`
  &.MuiButton-root {
    min-width: 0;
  }

  &.MuiButton-containedSecondary {
    &.MuiButton-sizeMedium {
      padding: 8px;
    }
  }
`;
