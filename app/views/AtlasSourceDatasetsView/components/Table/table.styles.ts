import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import { StyledToolbar as BaseStyledToolbar } from "../../../../components/Table/components/TableToolbar/tableToolbar.styles";

export const StyledFluidPaper = styled(FluidPaper)`
  display: grid;
  height: 100%;

  .MuiTableContainer-root {
    background-color: ${PALETTE.SMOKE_MAIN};
  }
`;

export const StyledToolbar = styled(BaseStyledToolbar)`
  &.MuiToolbar-root {
    min-height: 68px;
  }
`;
