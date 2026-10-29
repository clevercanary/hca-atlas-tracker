import { DETAIL_HERO_HEIGHT } from "@/app/components/Layout/components/Detail/components/DetailViewHero/constants";
import { DetailView } from "@/app/components/Layout/components/Detail/detailView";
import { TABLE_TOOLBAR_HEIGHT } from "@/app/components/Table/components/PinnedTableToolbar/constants";
import { TABLE_PAPER_TOP } from "@/app/components/Table/components/TablePaper/constants";
import { FOOTER_HEIGHT_VAR } from "@databiosphere/findable-ui/lib/components/Layout/components/Footer/common/constants";
import { HEADER_HEIGHT_VAR } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/common/constants";
import { TABLE_HEAD_TOP } from "@databiosphere/findable-ui/lib/components/Table/common/constants";
import { PROPERTY } from "@databiosphere/findable-ui/lib/hooks/useHtmlStyle/constants";
import { SUPPORTS_SCROLL_DRIVEN_ANIMATIONS } from "@databiosphere/findable-ui/lib/styles/common/constants/supports";
import {
  bpDownMd,
  bpUpSm,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { css, type SerializedStyles, type Theme } from "@emotion/react";
import styled from "@emotion/styled";

const TABLE_HEAD_HEIGHT = 57; /* fallback until measured: a one-line column head and its bottom line */

/**
 * Detail view for tabs whose table scrolls with the page (render its table
 * with `pageScroll`). From sm up, the hero pins below the header, the table's
 * toolbar, if pinned, below the hero, and the table's column head below both.
 *
 * Fallback, where the page scroll layout isn't supported: the view fits the
 * window and the table scrolls in its own box, as on findable-ui's index view.
 * Below md the footer is too tall to keep on screen, so the view fills the
 * window below the header and the footer follows.
 */
export const StyledDetailView = styled(DetailView)`
  ${TABLE_PAPER_TOP}: calc(
    ${HEADER_HEIGHT_VAR} + var(${DETAIL_HERO_HEIGHT}, 0px)
  );
  ${TABLE_HEAD_TOP}: calc(
    var(${TABLE_PAPER_TOP}) + var(${TABLE_TOOLBAR_HEIGHT}, 0px)
  );

  @supports not ${SUPPORTS_SCROLL_DRIVEN_ANIMATIONS} {
    max-height: calc(100dvh - ${HEADER_HEIGHT_VAR} - ${FOOTER_HEIGHT_VAR});

    ${bpDownMd} {
      max-height: calc(100dvh - ${HEADER_HEIGHT_VAR});
    }
  }
`;

/**
 * From sm up, where the hero, the table's toolbar (if pinned) and its column
 * head pin below the header, focus and hash links stop below them too. :root
 * outranks the header's html scroll padding.
 * @param theme - Theme.
 * @returns Global scroll padding styles for detail views with a pinned hero.
 */
export const detailScrollPadding = (theme: Theme): SerializedStyles => css`
  @supports ${SUPPORTS_SCROLL_DRIVEN_ANIMATIONS} {
    ${bpUpSm({ theme })} {
      :root {
        scroll-padding-top: calc(
          ${HEADER_HEIGHT_VAR} + var(${DETAIL_HERO_HEIGHT}, 0px) +
            var(${TABLE_TOOLBAR_HEIGHT}, 0px)
        );
      }

      :root:has(.MuiTableContainer-root) {
        scroll-padding-top: calc(
          ${HEADER_HEIGHT_VAR} + var(${DETAIL_HERO_HEIGHT}, 0px) +
            var(${TABLE_TOOLBAR_HEIGHT}, 0px) +
            var(${PROPERTY.TABLE_HEAD_HEIGHT}, ${TABLE_HEAD_HEIGHT}px)
        );
      }
    }
  }
`;
