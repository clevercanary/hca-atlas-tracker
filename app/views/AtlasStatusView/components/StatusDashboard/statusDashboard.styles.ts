import { bpUpMd } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";

export const StyledGrid = styled.div`
  align-items: start;
  display: grid;
  gap: 16px;
  grid-column: 1 / -1;
  grid-template-columns: 1fr;

  ${bpUpMd} {
    grid-template-columns: repeat(3, 1fr);
  }
`;
