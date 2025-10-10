import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import { FormLabel as MFormLabel } from "@mui/material";

export const FormLabel = styled(MFormLabel)`
  align-items: center;
  color: ${PALETTE.INK_MAIN};
  display: flex;
  font: ${FONT.BODY_400};
  gap: 16px;
  justify-content: space-between;

  &.Mui-error,
  &.Mui-disabled,
  &.Mui-focused {
    color: ${PALETTE.INK_MAIN};
  }

  .MuiLink-root {
    font-weight: 500;
    white-space: nowrap;
  }
`;
