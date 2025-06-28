import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { mediaTabletDown } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Grid, Typography } from "@mui/material";

interface Props {
  isError: boolean;
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
  shouldForwardProp: (prop) => prop !== "isError",
})<Props>`
  align-items: center;
  display: grid;
  gap: 4px;
  grid-auto-flow: column;
  justify-content: flex-start;

  ${({ isError }) =>
    isError &&
    css`
      color: ${PALETTE.ALERT_MAIN};
    `}
`;
