import {
  BODY_ROW,
  HEAD_ROW,
} from "@/app/views/AtlasStatusView/components/CurationReport/components/TableCard/tableCard.styles";
import { bpDownSm } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { type ThemeProps } from "@databiosphere/findable-ui/lib/theme/types";
import { css, type SerializedStyles } from "@emotion/react";
import styled from "@emotion/styled";

// File, Kind, State, Blocks, Should fix, Check.
const columns = ({ theme }: ThemeProps): SerializedStyles => css`
  grid-template-columns: minmax(0, 1fr) 136px 168px 64px 80px 56px;

  ${bpDownSm({ theme })} {
    grid-template-columns: minmax(0, 1fr) 128px;

    > :nth-child(2),
    > :nth-child(n + 4) {
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
