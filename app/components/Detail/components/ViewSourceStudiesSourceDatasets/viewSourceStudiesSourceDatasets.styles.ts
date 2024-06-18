import { mediaTabletUp } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";
import { Dialog as CommonDialog } from "../../../common/Dialog/dialog.styles";

export const Dialog = styled(CommonDialog)`
  .MuiPaper-root {
    ${mediaTabletUp} {
      max-width: 1224px;
    }
  }

  .MuiDialogContent-root {
    min-height: 48px;
    padding: 0;

    .MuiTableContainer-root {
      max-height: 488px;

      .MuiTable-root {
        .MuiTableCell-root {
          .MuiFormControlLabel-root {
            gap: 12px;

            .MuiFormControlLabel-label.Mui-disabled {
              color: inherit;
            }
          }
        }
      }
    }
  }
`;
