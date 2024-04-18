import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { TableToolbar as DXTableToolbar } from "@databiosphere/findable-ui/lib/components/Table/components/TableToolbar/tableToolbar.styles";
import { smokeLightest } from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
import styled from "@emotion/styled";

export const Paper = styled(FluidPaper)`
  &.MuiPaper-root {
    display: grid;
    gap: inherit;
    grid-column: 1 / -1;
  }

  .MuiTable-root {
    th {
      background-color: ${smokeLightest};
    }
  }
`;

export const TableToolbar = styled(DXTableToolbar)`
  justify-content: flex-end;
`;
