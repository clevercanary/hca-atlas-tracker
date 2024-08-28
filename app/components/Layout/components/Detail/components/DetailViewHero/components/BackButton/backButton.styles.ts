import { mediaDesktopSmallUp } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";
import { HeroActions as DetailViewActions } from "../../detailViewHero.styles";

export const HeroActions = styled(DetailViewActions)`
  ${mediaDesktopSmallUp} {
    align-self: flex-start;
    margin: 8px 0;
  }
`;
