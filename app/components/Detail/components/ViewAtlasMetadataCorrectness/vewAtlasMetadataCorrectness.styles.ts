import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import styled from "@emotion/styled";

export const SectionPaper = styled(FluidPaper)`
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.MuiPaper-root {
    grid-column: 1 / -1;
    padding: 16px;
  }
`;
