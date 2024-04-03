import {
  mediaDesktopSmallUp,
  mediaTabletUp,
} from "@clevercanary/data-explorer-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";
import { ButtonPrimaryNextLink } from "../../../common/Button/components/ButtonPrimaryNextLink/buttonPrimaryNextLink";

export const Button = styled(ButtonPrimaryNextLink)`
  ${mediaTabletUp} {
    grid-row: 2;
    justify-self: flex-start;
  }

  ${mediaDesktopSmallUp} {
    grid-row: unset;
    justify-self: flex-end;
  }
`;
