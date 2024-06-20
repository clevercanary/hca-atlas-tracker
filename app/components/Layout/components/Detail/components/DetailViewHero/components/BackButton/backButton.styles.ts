import { mediaDesktopSmallUp } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { inkLight } from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
import styled from "@emotion/styled";
import { HeroActions as DetailViewActions } from "../../detailViewHero.styles";

export const HeroActions = styled(DetailViewActions)`
  .MuiIconButton-root {
    .MuiSvgIcon-root {
      color: ${inkLight};
    }
  }

  ${mediaDesktopSmallUp} {
    align-self: flex-start;
    margin: 8px 0;
  }
`;
