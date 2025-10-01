import { bpUpMd } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";
import { HeroActions as DetailViewActions } from "../../../../components/Layout/components/Detail/components/DetailViewHero/detailViewHero.styles";

export const HeroActions = styled(DetailViewActions)`
  .MuiButton-root {
    padding: 8px 16px;
  }

  ${bpUpMd} {
    align-self: flex-start;
    margin: 8px 0;
  }
`;
