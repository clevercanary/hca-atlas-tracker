import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { sectionPadding } from "@databiosphere/findable-ui/lib/components/common/Section/section.styles";
import {
  mediaDesktopSmallUp,
  mediaTabletUp,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { inkLight } from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
import {
  textBody400,
  textBodyLarge500,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/fonts";
import styled from "@emotion/styled";

interface SectionProps {
  fullWidth?: boolean;
}

export const Section = styled.div`
  align-items: flex-start;
  display: grid;
  gap: 16px;
  grid-column: 1 / -1;
  grid-template-columns: inherit;

  ${mediaTabletUp} {
    gap: inherit;
  }
`;

export const SectionHero = styled("div")<SectionProps>`
  display: grid;
  gap: 8px;
  padding: 0 16px;

  ${mediaTabletUp} {
    grid-column: ${({ fullWidth }) => (fullWidth ? "1 / -1" : "span 4")};
    padding: 0;
  }
`;

export const SectionTitle = styled.h3`
  ${textBodyLarge500};
  font-weight: 600;
  margin: 0;
`;

export const SectionText = styled.div`
  ${textBody400};
  color: ${inkLight};
  font-size: 13px;
`;

export const SectionCard = styled(FluidPaper)`
  ${sectionPadding};
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;

  ${mediaTabletUp} {
    grid-column: 6 / span 7;
  }

  ${mediaDesktopSmallUp} {
    grid-template-columns: 1fr 1fr;
  }
`;
