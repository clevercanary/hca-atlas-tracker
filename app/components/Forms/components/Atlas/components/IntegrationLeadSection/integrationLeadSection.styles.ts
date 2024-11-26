import { mediaDesktopSmallUp } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";
import { Button } from "@mui/material";

export const ControllerAction = styled.div`
  display: grid;
  grid-column: 2;
  grid-row: auto / span 2;
  grid-template-rows: subgrid;

  ${mediaDesktopSmallUp} {
    grid-column: 3;
    grid-row: auto;
  }

  .MuiIconButton-root {
    align-self: flex-end;
    grid-row: 1;
    justify-self: flex-end;
  }
`;

export const StyledButton = styled(Button)`
  grid-column: 1;
  justify-self: flex-start;
`;
