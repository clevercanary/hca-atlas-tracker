import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { mediaTabletDown } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Grid, Typography } from "@mui/material";

interface Props {
  summaryCount: number;
  summaryKey: string;
}

export const StyledGrid = styled(Grid)`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(4, 1fr);

  .MuiPaper-root {
    display: grid;
    gap: 4px;
    grid-template-rows: auto 1fr;
    padding: 20px;
  }

  ${mediaTabletDown} {
    grid-template-columns: repeat(2, 1fr);
    padding: 0 16px;
  }
`;

export const StyledTypography = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "summaryCount" && prop !== "summaryKey",
})<Props>`
  align-items: center;
  display: grid;
  gap: 4px;
  grid-auto-flow: column;
  justify-content: flex-start;

  & {
    font-family: "Inter", sans-serif;
    font-size: 24px;
    font-weight: 500;
  }

  .MuiSvgIcon-root {
    display: none;
  }

  ${({ summaryCount, summaryKey }) =>
    summaryKey === "errorCount" &&
    css`
      color: ${summaryCount > 0 ? PALETTE.ALERT_MAIN : PALETTE.SUCCESS_MAIN};

      .MuiSvgIcon-root {
        display: block;
      }
    `}
`;
