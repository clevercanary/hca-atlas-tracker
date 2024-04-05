import {
  mediaDesktopSmallUp,
  mediaTabletUp,
} from "@clevercanary/data-explorer-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";
import { ButtonLink } from "../../../../../common/Button/components/ButtonLink/buttonLink";

export const Button = styled(ButtonLink)`
  ${mediaTabletUp} {
    grid-row: 2;
    justify-self: flex-start;
  }

  ${mediaDesktopSmallUp} {
    grid-row: unset;
    justify-self: flex-end;
  }
`;
