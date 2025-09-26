import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import { Tabs } from "@mui/material";

export const StyledTabs = styled(Tabs)`
  padding: 0 20px;

  .MuiTabs-list {
    gap: 20px;
  }

  .MuiTab-root {
    font-weight: 400;

    .MuiSvgIcon-colorError {
      color: ${PALETTE.ALERT_MAIN};
    }
  }
`;
