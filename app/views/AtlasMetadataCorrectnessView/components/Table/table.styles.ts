import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { bpDownSm } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";
import { Toolbar, Typography } from "@mui/material";
import { Table } from "../../../../components/Entity/components/common/Table/table";

export const StyledFluidPaper = styled(FluidPaper)`
  background-color: ${PALETTE.SMOKE_MAIN};
  display: grid;
  gap: 1px;
`;

export const StyledToolbar = styled(Toolbar)`
  & {
    background-color: ${PALETTE.COMMON_WHITE};
    flex-wrap: wrap;
    gap: 16px 24px;
    justify-content: space-between;
    padding: 16px;
  }
`;

export const StyledTypography = styled(Typography)`
  & {
    font-family: "Inter";
    font-size: 20px;
    font-weight: 500;
    line-height: 28px;
  }
`;

export const StyledTable = styled(Table)`
  .MuiTable-root {
    gap: 1px;

    .MuiTableRow-root {
      background-color: transparent;

      .MuiTableCell-root {
        background-color: ${PALETTE.COMMON_WHITE};
        padding: 8px 12px;

        &:first-of-type {
          box-shadow: 1px 0 0 0 ${PALETTE.SMOKE_MAIN};
          left: 0;
          position: sticky;
          word-break: break-word;
          z-index: 2;
        }
      }

      .MuiTableCell-head {
        font: ${FONT.BODY_400};
      }

      .MuiTableCell-body {
        min-height: 36px;

        &:not(:first-of-type) {
          padding: 0;
        }
      }
    }
  }

  ${bpDownSm} {
    .MuiTableBody-root {
      .MuiTableRow-root {
        .MuiTableCell-root {
          padding: 0;
        }
      }
    }
  }
` as typeof Table;
