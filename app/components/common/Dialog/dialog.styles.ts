import { Dialog as DXDialog } from "@databiosphere/findable-ui/lib/components/common/Dialog/dialog";
import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";

export const StyledDialog = styled(DXDialog)`
  & .MuiDialog-paper {
    border-radius: 8px;
  }

  & .MuiDialogActions-root,
  & .MuiDialogContent-root,
  & .MuiDialogTitle-root {
    padding: 16px;
  }

  & .MuiDialogTitle-root {
    gap: 8px;
    grid-template-columns: 1fr auto;
    font: ${FONT.BODY_LARGE_500};
    line-height: 26px;

    .MuiButtonBase-root {
      color: ${PALETTE.INK_LIGHT};
      padding: 3px 4px;

      .MuiSvgIcon-root {
        font-size: 20px;
      }
    }
  }

  & .MuiDialogActions-root {
    gap: 8px;
  }
`;
