import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { sectionPadding } from "@databiosphere/findable-ui/lib/components/common/Section/section.styles";
import { mediaTabletDown } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";

export const StyledFluidPaper = styled(FluidPaper)`
  ${sectionPadding};
  display: block;
  grid-column: 1 / -1;

  ${mediaTabletDown} {
    grid-column: 1 / -1;
  }

  .MuiDivider-root {
    margin: 16px 0;
  }
`;
