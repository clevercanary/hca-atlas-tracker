import {
  BackPageContent as DXBackPageContent,
  BackPageView as DXBackPageView,
} from "@databiosphere/findable-ui/lib/components/Layout/components/BackPage/backPageView.styles";
import {
  bpUpLg,
  bpUpMd,
  bpUpSm,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";

export const DetailView = styled(DXBackPageView)`
  align-content: flex-start;
  gap: 24px 16px;
  grid-template-columns: 1fr;
  height: 100%;
  min-height: 0;

  ${bpUpSm} {
    grid-template-columns: repeat(12, 1fr);
  }

  ${bpUpMd} {
    margin: 0 24px;
    max-width: unset;
  }
`;

export const DetailViewContent = styled(DXBackPageContent)`
  align-content: flex-start;
  gap: inherit;
  min-height: 0;

  ${bpUpSm} {
    gap: inherit;
    grid-template-columns: subgrid;
  }

  ${bpUpLg} {
    gap: 24px 0;
    grid-template-columns: 1fr minmax(712px, 840px) 1fr;
  }
`;
