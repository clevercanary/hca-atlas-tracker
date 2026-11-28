import {
  BODY_ROW,
  HEAD_ROW,
} from "@/app/views/AtlasStatusView/components/CurationReport/components/TableCard/tableCard.styles";
import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { bpDownSm } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { type ThemeProps } from "@databiosphere/findable-ui/lib/theme/types";
import { css, type SerializedStyles } from "@emotion/react";
import styled from "@emotion/styled";

// #, Issue, Priority, Objects, Datasets, Owner.
const columns = ({ theme }: ThemeProps): SerializedStyles => css`
  grid-template-columns: 24px minmax(0, 1fr) 128px 80px 80px 112px;

  ${bpDownSm({ theme })} {
    grid-template-columns: 24px minmax(0, 1fr) 56px 56px;

    > :nth-child(3),
    > :nth-child(6) {
      display: none;
    }
  }
`;

export const StyledHeadRow = styled.div`
  ${HEAD_ROW};
  ${columns};
`;

export const StyledRow = styled.div`
  ${BODY_ROW};
  ${columns};
`;

// Issue title with its description under it, so the list reads as a report.
export const StyledIssue = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
  padding: 4px 0;
`;

export const StyledDetail = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: ${PALETTE.INK_LIGHT};
  display: -webkit-box;
  font: ${FONT.BODY_SMALL_400_2_LINES};
  margin: 0;
  overflow: hidden;
`;
