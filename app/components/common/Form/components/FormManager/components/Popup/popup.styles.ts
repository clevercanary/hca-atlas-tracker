import { DialogTitle as DXDialogTitle } from "@databiosphere/findable-ui/lib/components/common/Dialog/components/DialogTitle/dialogTitle";
import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import styled from "@emotion/styled";
import {
  Dialog as MDialog,
  DialogActions as MDialogActions,
  DialogContent as MDialogContent,
} from "@mui/material";
import { COLOR_MIXES } from "../../../../../../../styles/common/constants/colorMixes";

export const Dialog = styled(MDialog)`
  .MuiBackdrop-root {
    background-color: ${COLOR_MIXES.INK_MAIN_90};
  }

  .MuiDialog-paper {
    border-radius: 8px;
    max-width: 456px;
  }
`;

export const DialogTitle = styled(DXDialogTitle)`
  &.MuiDialogTitle-root {
    font: ${FONT.BODY_LARGE_500};
    justify-content: space-between;
    padding: 16px;

    .MuiSvgIcon-root {
      font-size: 20px;
    }
  }
`;

export const DialogContent = styled(MDialogContent)`
  font: ${FONT.BODY_400};
  padding: 16px;
`;

export const DialogActions = styled(MDialogActions)`
  gap: 8px;
  flex-wrap: wrap;
  padding: 16px;

  .MuiButton-root {
    margin: 0;
    text-transform: none;
  }
`;
