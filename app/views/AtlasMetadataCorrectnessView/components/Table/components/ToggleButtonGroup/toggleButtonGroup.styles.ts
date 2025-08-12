import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import { ToggleButtonGroup } from "@mui/material";

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)`
  grid-auto-columns: auto;

  .MuiToggleButton-root {
    text-transform: none;

    &:not(.Mui-selected) {
      color: ${PALETTE.INK_LIGHT};
    }
  }
`;
