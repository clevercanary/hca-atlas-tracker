import { Dialog as DXDialog } from "@databiosphere/findable-ui/lib/components/common/Dialog/dialog";
import { inkLight } from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
import { textBodyLarge500 } from "@databiosphere/findable-ui/lib/styles/common/mixins/fonts";
import styled from "@emotion/styled";

export const Dialog = styled(DXDialog)`
  & .MuiDialog-paper {
    border-radius: 8px;
  }

  & .MuiDialogTitle-root {
    ${textBodyLarge500};
    gap: 8px;
    line-height: 26px;

    .MuiButtonBase-root {
      color: ${inkLight};
      padding: 3px 4px;

      .MuiSvgIcon-root {
        font-size: 20px;
      }
    }
  }

  & .MuiDialogActions-root {
    gap: 8px;
  }

  & .MuiDialogTitle-root,
  & .MuiDialogContent-root,
  & .MuiDialogActions-root {
    padding: 16px;
  }
`;
