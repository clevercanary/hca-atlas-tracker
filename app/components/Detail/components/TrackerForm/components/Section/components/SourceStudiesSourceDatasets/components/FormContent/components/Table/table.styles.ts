import { smokeMain } from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
import styled from "@emotion/styled";
import { Table as CommonTable } from "../../../../../../../../../../../Table/table.styles";

export const DetailTable = styled(CommonTable)`
  background-color: ${smokeMain};

  .MuiTable-root {
    .MuiTableBody-root {
      .MuiTableRow-root[id^="sub-row"] {
        .MuiTableCell-root:first-of-type {
          padding-left: 46px;
        }
      }
    }
  }
` as typeof CommonTable;
