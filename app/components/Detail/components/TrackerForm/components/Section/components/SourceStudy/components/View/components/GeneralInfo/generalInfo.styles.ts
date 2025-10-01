import { sectionPadding } from "@databiosphere/findable-ui/lib/components/common/Section/section.styles";
import { bpUpMd } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";
import { SectionCard } from "../../../../../../section.styles";

export const StyledSectionCard = styled(SectionCard)`
  & {
    display: block;
    gap: 0;
    padding: 0;
  }
`;

export const SectionContent = styled.div`
  ${sectionPadding};
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;

  ${bpUpMd} {
    grid-template-columns: 1fr 1fr;
  }
`;
