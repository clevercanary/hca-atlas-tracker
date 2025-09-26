import styled from "@emotion/styled";
import { Dialog } from "@mui/material";

export const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    max-width: 544px;

    .MuiDialogTitle-root {
      padding: 16px 20px;
    }

    .MuiDialogContent-root {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .MuiDialogActions-root {
      gap: 12px;
      justify-content: flex-start;
      padding: 16px 20px;

      .MuiButton-root {
        margin: 0;
      }
    }
  }
`;
