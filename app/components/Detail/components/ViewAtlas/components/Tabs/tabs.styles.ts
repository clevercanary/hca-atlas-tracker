import { Tabs } from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";
import { mediaTabletDown } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";

export const StyledTabs = styled(Tabs)`
  &.MuiTabs-root {
    ${mediaTabletDown} {
      width: 100vw;
    }
  }
`;
