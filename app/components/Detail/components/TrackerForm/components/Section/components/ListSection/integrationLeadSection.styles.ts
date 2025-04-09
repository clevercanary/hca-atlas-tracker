import { mediaDesktopSmallUp } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";
import { Button } from "@mui/material";

interface ControllerActionProps {
  inputRowCount: number;
}

export const ControllerAction = styled.div<ControllerActionProps>`
  grid-column: 2;
  grid-row: auto / span ${(props) => props.inputRowCount};

  padding-top: 24px;

  ${mediaDesktopSmallUp} {
    grid-column: 3;
    grid-row: auto;
  }
`;

export const StyledButton = styled(Button)`
  grid-column: 1;
  justify-self: flex-start;
`;
