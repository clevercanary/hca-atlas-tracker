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
import {
  GRID_TRACK_ONE,
  GRID_TRACK_ONE_RANGE,
  RESPONSIVE_BREAKPOINT,
  RESPONSIVE_BREAKPOINT_RANGE,
} from "./constants";

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

  ${mediaDesktopSmallUp} {
    gap: 24px 0;
    grid-template-columns:
      clamp(
        ${GRID_TRACK_ONE.MIN_WIDTH}px,
        calc(
          ${GRID_TRACK_ONE.MAX_WIDTH}px -
            (
              ${GRID_TRACK_ONE_RANGE} *
                (100vw - ${RESPONSIVE_BREAKPOINT.START}px) /
                ${RESPONSIVE_BREAKPOINT_RANGE}
            )
        ),
        ${GRID_TRACK_ONE.MAX_WIDTH}px
      )
      minmax(712px, 840px)
      minmax(0, 1fr);
  }

  ${mediaDesktopUp} {
    grid-template-columns:
      1fr
      840px
      1fr;
  }
`;
