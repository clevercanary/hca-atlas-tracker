import { bpUpSm } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";
import { Tabs as MTabs } from "@mui/material";

export const Tabs = styled(MTabs)`
  &.MuiTabs-root {
    .MuiTabs-scroller {
      margin-top: 2px;
      padding: 0 16px;

      ${bpUpSm} {
        padding: 0 20px;
      }

      .MuiTab-root {
        flex: 1;
      }
    }
  }
`;
