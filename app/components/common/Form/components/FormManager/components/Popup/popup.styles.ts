import { DialogTitle as DXDialogTitle } from "@databiosphere/findable-ui/lib/components/common/Dialog/components/DialogTitle/dialogTitle";
import { inkMain } from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
import {
  textBody400,
  textBodyLarge500,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/fonts";
import styled from "@emotion/styled";
import {
  Dialog as MDialog,
  DialogActions as MDialogActions,
  DialogContent as MDialogContent,
} from "@mui/material";

export const Dialog = styled(MDialog)`
  .MuiBackdrop-root {
    background-color: ${inkMain}e6;
  }

  .MuiDialog-paper {
    border-radius: 8px;
    max-width: 456px;
  }
`;

export const DialogTitle = styled(DXDialogTitle)`
  &.MuiDialogTitle-root {
    ${textBodyLarge500};
    justify-content: space-between;
    padding: 16px;

    .MuiSvgIcon-root {
      font-size: 20px;
    }
  }
`;

export const DialogContent = styled(MDialogContent)`
  ${textBody400};
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
