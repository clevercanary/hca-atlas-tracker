import { StyledDialog as CommonDialog } from "@/app/components/common/Dialog/dialog.styles";
import { bpUpSm } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";

export const Dialog = styled(CommonDialog)`
  .MuiPaper-root {
    ${bpUpSm} {
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
