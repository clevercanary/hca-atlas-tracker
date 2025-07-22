import { mediaTabletUp } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
interface Props {
  fullWidth?: boolean;
}

export const StyledSection = styled.div<Props>`
  align-items: flex-start;
  display: grid;
  gap: 16px;
  grid-column: 1 / -1;
  grid-template-columns: inherit;

  ${mediaTabletUp} {
    gap: inherit;
  }

  ${({ fullWidth }) =>
    fullWidth &&
    css`
      grid-template-columns: 1fr;
    `}
`;
