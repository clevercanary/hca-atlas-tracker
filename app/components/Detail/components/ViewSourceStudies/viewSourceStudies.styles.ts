import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { Table as DXTable } from "@databiosphere/findable-ui/lib/components/Detail/components/Table/table";
import { Toolbar as DXTToolbar } from "@databiosphere/findable-ui/lib/components/Table/components/TableToolbar/tableToolbar.styles";
import { mediaTabletUp } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { smokeLightest } from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
import styled from "@emotion/styled";

export const Paper = styled(FluidPaper)`
  &.MuiPaper-root {
    display: grid;
    gap: inherit;
    grid-column: 1 / -1;
  }
`;

export const Toolbar = styled(DXTToolbar)`
  &.MuiToolbar-table {
    justify-content: flex-end;
    padding: 16px;
  }
`;

export const Table = styled(DXTable)`
  &.MuiTableContainer-root {
    .MuiTable-root {
      .MuiTableHead-root {
        .MuiTableRow-root {
          .MuiTableCell-root {
            background-color: ${smokeLightest};
          }
        }
      }

      ${mediaTabletUp} {
        .MuiTableHead-root,
        .MuiTableBody-root {
          .MuiTableRow-root {
            .MuiTableCell-root {
              min-height: 56px;
              padding: 12px 16px;
            }
          }
        }
      }
    }
  }
` as typeof DXTable;
