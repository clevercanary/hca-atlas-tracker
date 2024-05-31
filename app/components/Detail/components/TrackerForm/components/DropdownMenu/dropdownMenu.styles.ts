import { DropdownMenu as DXDropdownMenu } from "@databiosphere/findable-ui/lib/components/common/DropdownMenu/dropdownMenu";
import { IconButtonSecondary as DXIconButton } from "@databiosphere/findable-ui/lib/components/common/IconButton/iconButton.styles";
import { inkLight } from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
import styled from "@emotion/styled";

export const DropdownMenu = styled(DXDropdownMenu)`
  .MuiPaper-menu {
    min-width: 288px;
  }
`;

export const IconButton = styled(DXIconButton)`
  .MuiSvgIcon-root {
    color: ${inkLight};
  }
`;
