import { HEADER_HEIGHT_VAR } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/common/constants";
import {
  bpUpMd,
  bpUpSm,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import {
  pinned as pinnedAt,
  pinnedFocus,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/pinned";
import { css } from "@emotion/react";
import styled from "@emotion/styled";

interface Props {
  pinned: boolean;
}

// From sm up, a pinned hero stays below the header as the page scrolls; below
// sm it scrolls away with the page, leaving the screen to the table. It takes
// over the view's 24px top padding and the 24px row gap below it, so its
// background covers the rows scrolling underneath and its layout is unchanged.
// Sideways shadows in the background colour cover the view's side margins (up
// to 24px), where the shadows of content scrolling underneath (e.g. an alert's)
// would otherwise show; unlike a spread, they don't reach below the hero, over
// the table's pinned toolbar or column head.
export const DetailViewHero = styled.div<Props>`
  display: grid;
  gap: 16px;
  grid-column: 1 / -1;

  ${({ pinned, theme }) =>
    pinned &&
    css`
      ${bpUpSm({ theme })} {
        background-color: ${theme.palette.background.default};
        box-shadow:
          -24px 0 0 ${theme.palette.background.default},
          24px 0 0 ${theme.palette.background.default};
        margin: -24px 0;
        padding: 24px 0;
        z-index: 4; /* above the table's pinned toolbar and column head */
        ${pinnedAt(HEADER_HEIGHT_VAR)};
        ${pinnedFocus};
      }
    `}
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

  ${bpUpSm} {
    align-items: center;
    flex-direction: row;
  }

  .MuiTypography-heading-large {
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
