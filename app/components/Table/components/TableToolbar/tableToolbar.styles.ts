import { Toolbar as DXTToolbar } from "@databiosphere/findable-ui/lib/components/Table/components/TableToolbar/tableToolbar.styles";
import styled from "@emotion/styled";

export const Toolbar = styled(DXTToolbar)`
  &.MuiToolbar-table {
    justify-content: flex-end;
    padding: 16px;

    .MuiButton-root {
      &.MuiButton-containedSecondary {
        .MuiButton-iconSizeSmall {
          font-size: 20px;
          margin-left: -4px;

          .MuiSvgIcon-root {
            font-size: inherit;
          }
        }
      }
    }
  }
`;
