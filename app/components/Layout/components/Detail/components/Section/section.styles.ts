import { SectionContent } from "@databiosphere/findable-ui/lib/components/common/MDXMarkdown/components/Section/mdxSection.styles";
import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { textBody4002Lines } from "@databiosphere/findable-ui/lib/styles/common/mixins/fonts";
import styled from "@emotion/styled";

export const StyledFluidPaper = styled(FluidPaper)`
  grid-column: 1 / -1;
  padding: 16px;
`;

export const StyledSectionContent = styled(SectionContent)`
  ${textBody4002Lines};

  ol,
  ul {
    margin: 0;
    padding-left: 24px;
  }

  li {
    margin: 8px 0;
  }
`;
