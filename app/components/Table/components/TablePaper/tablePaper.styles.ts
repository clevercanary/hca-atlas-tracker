import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import styled from "@emotion/styled";

export const Paper = styled(FluidPaper)`
  &.MuiPaper-root {
    display: grid;
    gap: inherit;
    grid-column: 1 / -1;
  }
`;
