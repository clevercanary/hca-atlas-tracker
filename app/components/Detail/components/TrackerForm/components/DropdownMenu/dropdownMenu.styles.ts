import { DropdownMenu as DXDropdownMenu } from "@databiosphere/findable-ui/lib/components/common/DropdownMenu/dropdownMenu";
import { IconButton } from "@databiosphere/findable-ui/lib/components/common/IconButton/iconButton";
import { inkLight } from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
import styled from "@emotion/styled";

export const DropdownMenu = styled(DXDropdownMenu)`
  .MuiPaper-menu {
    min-width: 288px;
  }
`;

export const StyledIconButton = styled(IconButton)`
  &.MuiIconButton-root {
    .MuiSvgIcon-root {
      color: ${inkLight};
    }
  }
`;
