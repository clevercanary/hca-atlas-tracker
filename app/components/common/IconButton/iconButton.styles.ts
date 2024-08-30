import { IconButton as DXIconButton } from "@databiosphere/findable-ui/lib/components/common/IconButton/iconButton";
import { inkLight } from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
import styled from "@emotion/styled";

export const StyledIconButton = styled(DXIconButton)`
  &.MuiIconButton-root {
    &.MuiIconButton-sizeMedium {
      padding: 8px;
    }

    .MuiSvgIcon-root {
      color: ${inkLight};
    }
  }
`;
