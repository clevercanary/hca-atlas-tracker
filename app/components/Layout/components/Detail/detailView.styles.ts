import {
  BackPageContent as DXBackPageContent,
  BackPageView as DXBackPageView,
} from "@databiosphere/findable-ui/lib/components/Layout/components/BackPage/backPageView.styles";
import {
  mediaDesktopSmallUp,
  mediaDesktopUp,
  mediaTabletUp,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";

export const DetailView = styled(DXBackPageView)`
  gap: 24px 16px;
  grid-template-columns: 1fr;

  ${mediaTabletUp} {
    grid-template-columns: repeat(12, 1fr);
  }

  ${mediaDesktopSmallUp} {
    margin: 0 24px;
    max-width: unset;
  }
`;

export const DetailViewContent = styled(DXBackPageContent)`
  gap: inherit;

  ${mediaTabletUp} {
    gap: inherit;
    grid-template-columns: subgrid;
  }

  ${mediaDesktopUp} {
    gap: 24px 0;
    grid-template-columns: 1fr minmax(712px, 840px) 1fr;
  }
`;
