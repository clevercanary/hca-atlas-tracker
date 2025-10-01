import { bpUpMd } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";
import { HeroActions as DetailViewActions } from "../../../../../Layout/components/Detail/components/DetailViewHero/detailViewHero.styles";

export const HeroActions = styled(DetailViewActions)`
  ${bpUpMd} {
    align-self: flex-start;
    margin: 8px 0;
  }
`;
