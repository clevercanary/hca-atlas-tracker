import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import { FormHelperText as MFormHelperText } from "@mui/material";

export const FormHelperText = styled(MFormHelperText)`
  align-items: flex-start;
  display: flex;
  gap: 4px;
  margin: 0;

  &.Mui-error {
    color: ${PALETTE.WARNING_MAIN};

    .MuiSvgIcon-root {
      color: inherit;
    }
  }
}
`;
