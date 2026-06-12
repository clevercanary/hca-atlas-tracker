import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { sectionPadding } from "@databiosphere/findable-ui/lib/components/common/Section/section.styles";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import { Chip, LinearProgress, Stack } from "@mui/material";

export const StyledFluidPaper = styled(FluidPaper)`
  align-self: flex-start;
  width: 100%;
`;

export const StyledStack = styled(Stack)`
  gap: 12px;
  ${sectionPadding};

  &:not(:last-of-type) {
    border-bottom: 1px solid ${PALETTE.SMOKE_MAIN};
  }
`;

export const StyledProgress = styled(LinearProgress)`
  background-color: ${PALETTE.SMOKE_MAIN};
  border-radius: 100px;

  .MuiLinearProgress-bar {
    border-radius: 100px;
  }
`;

export const StyledChip = styled(Chip)`
  align-self: flex-start;

  .MuiSvgIcon-fontSizeXxsmall {
    font-size: 12px;
  }
`;
