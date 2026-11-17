import { StyledDialog as TrackerDialog } from "@/app/components/common/Dialog/dialog.styles";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";

export const StyledDialog = styled(TrackerDialog)`
  .MuiDialogContent-root {
    display: flex;
    flex-direction: column;
    gap: 12px;

    > ul {
      border: 1px solid ${PALETTE.SMOKE_MAIN};
      border-radius: 8px;
      max-height: 360px;
      overflow-y: auto;
    }
  }
`;

export const StyledTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;
