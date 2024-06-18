import { Table as DXTable } from "@databiosphere/findable-ui/lib/components/Detail/components/Table/table";
import { mediaTabletUp } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { smokeLightest } from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
import { ThemeProps } from "@databiosphere/findable-ui/lib/theme/theme";
import { css } from "@emotion/react";
import styled from "@emotion/styled";

export const tableStyles = (props: ThemeProps) => css`
  .MuiTable-root {
    .MuiTableHead-root {
      .MuiTableRow-root {
        .MuiTableCell-root {
          background-color: ${smokeLightest(props)};
        }
      }
    }

    ${mediaTabletUp(props)} {
      .MuiTableHead-root,
      .MuiTableBody-root {
        .MuiTableRow-root {
          .MuiTableCell-root {
            min-height: 56px;
            padding: 10px 16px;

            &.MuiTableCell-paddingCheckbox {
              padding-right: 0;
            }
          }
        }
      }
    }
  }
`;

export const Table = styled(DXTable)`
  &.MuiTableContainer-root {
    ${tableStyles}
  }
` as typeof DXTable;
