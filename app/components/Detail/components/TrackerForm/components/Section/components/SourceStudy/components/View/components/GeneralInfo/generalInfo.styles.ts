import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { sectionPadding } from "@databiosphere/findable-ui/lib/components/common/Section/section.styles";
import {
  mediaDesktopSmallUp,
  mediaTabletUp,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";

export const SectionCard = styled(FluidPaper)`
  ${mediaTabletUp} {
    grid-column: 6 / span 7;
  }

  ${mediaDesktopSmallUp} {
    grid-template-columns: 1fr 1fr;
  }
`;

export const SectionContent = styled.div`
  ${sectionPadding};
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;

  ${mediaDesktopSmallUp} {
    grid-template-columns: 1fr 1fr;
  }
`;
