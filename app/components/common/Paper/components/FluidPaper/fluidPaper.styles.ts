import { mediaTabletDown } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";
import { RoundedPaper } from "../RoundedPaper/roundedPaper";

export const StyledPaper = styled(RoundedPaper)`
  ${mediaTabletDown} {
    border-left: none;
    border-radius: 0;
    border-right: none;
    box-shadow: none;
  }
`;
