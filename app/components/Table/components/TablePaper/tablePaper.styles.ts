import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import styled from "@emotion/styled";

export const StyledFluidPaper = styled(FluidPaper)`
  &.MuiPaper-root {
    display: grid;
    gap: inherit;
    grid-column: 1 / -1;
  }
`;
