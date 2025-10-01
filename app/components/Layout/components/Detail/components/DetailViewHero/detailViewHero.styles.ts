import {
  bpUpMd,
  mediaTabletUp,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";

export const DetailViewHero = styled.div`
  display: grid;
  gap: 16px;
  grid-column: 1 / -1;
`;

export const DetailViewHeroHeadline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  ${bpUpMd} {
    flex-direction: row;
  }
`;

export const HeroHeader = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
`;

export const HeroTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  ${mediaTabletUp} {
    align-items: center;
    flex-direction: row;
  }

  .MuiTypography-text-heading-large {
    max-width: 726px;
  }
`;

export const Titles = styled.div`
  display: grid;
  gap: 4px;
`;

export const Statuses = styled.div`
  display: flex;
  gap: 8px;
`;

export const HeroActions = styled.div`
  align-items: center;
  align-self: flex-start;
  display: flex;
  gap: 8px;

  ${bpUpMd} {
    align-self: center;
  }
`;
