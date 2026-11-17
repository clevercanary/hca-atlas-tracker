import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { css } from "@emotion/react";
import styled from "@emotion/styled";

export const StyledCard = styled(FluidPaper)`
  overflow: hidden;
  width: 100%;
`;

export const StyledToolbar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${PALETTE.SMOKE_MAIN};
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  justify-content: space-between;
  padding: 16px;
`;

// A slim row under the toolbar: active filter tags, the summary line.
export const StyledBand = styled.div`
  border-bottom: 1px solid ${PALETTE.SMOKE_MAIN};
  padding: 12px 16px;
`;

// Shared by every view's rows; each view sets its own grid columns.
const ROW = css`
  align-items: center;
  display: grid;
  gap: 16px;
  min-height: 56px;
  padding: 0 16px;
`;

export const HEAD_ROW = css`
  ${ROW};
  background-color: ${PALETTE.SMOKE_LIGHTEST};
  border-bottom: 1px solid ${PALETTE.SMOKE_MAIN};
  color: ${PALETTE.INK_MAIN};
  font: ${FONT.BODY_500};
`;

export const BODY_ROW = css`
  ${ROW};

  &:not(:last-of-type) {
    border-bottom: 1px solid ${PALETTE.SMOKE_MAIN};
  }
`;

// A row's title link (theme MuiLink), truncated to one line.
export const StyledRowTitle = styled.div`
  justify-self: start;
  max-width: 100%;
  min-width: 0;

  .MuiLink-root {
    display: block;
    max-width: 100%;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

// The dash in an empty cell, quieter than any value.
export const StyledEmpty = styled.span`
  color: ${PALETTE.SMOKE_DARK};
  font: ${FONT.BODY_400};
`;
