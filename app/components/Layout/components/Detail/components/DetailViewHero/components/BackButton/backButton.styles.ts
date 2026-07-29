import { HeroActions as DetailViewActions } from "@/app/components/Layout/components/Detail/components/DetailViewHero/detailViewHero.styles";
import { bpUpMd } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";

export const HeroActions = styled(DetailViewActions)`
  ${bpUpMd} {
    align-self: flex-start;
    margin: 8px 0;
  }
`;
