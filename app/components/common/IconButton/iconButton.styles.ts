import { IconButton as DXIconButton } from "@databiosphere/findable-ui/lib/components/common/IconButton/iconButton";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";

export const StyledIconButton = styled(DXIconButton)`
  &.MuiIconButton-root {
    &.MuiIconButton-sizeMedium {
      padding: 8px;
    }

    .MuiSvgIcon-root {
      color: ${PALETTE.INK_LIGHT};
    }
  }
`;
