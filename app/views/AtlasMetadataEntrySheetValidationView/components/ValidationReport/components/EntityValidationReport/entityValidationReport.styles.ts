import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { sectionPadding } from "@databiosphere/findable-ui/lib/components/common/Section/section.styles";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { mediaTabletDown } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";
import { Grid, Typography } from "@mui/material";

export const StyledFluidPaper = styled(FluidPaper)`
  background-color: ${PALETTE.SMOKE_MAIN};
  display: grid;
  gap: 1px;
  grid-column: 1 / -1;

  ${mediaTabletDown} {
    grid-column: 1 / -1;
  }

  .MuiDivider-root {
    margin: 12px 0;
  }

  .MuiButton-textPrimary {
    align-self: flex-start;
    margin-top: 8px;
    text-transform: none;
  }
`;

export const StyledTypography = styled(Typography)`
  ${sectionPadding};
  background-color: ${PALETTE.COMMON_WHITE};
` as typeof Typography;

export const StyledGrid = styled(Grid)`
  ${sectionPadding};
  background-color: ${PALETTE.COMMON_WHITE};
`;
