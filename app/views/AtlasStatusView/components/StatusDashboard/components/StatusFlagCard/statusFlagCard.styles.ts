import { sectionPadding } from "@databiosphere/findable-ui/lib/components/common/Section/section.styles";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import { Stack } from "@mui/material";

export const StyledStack = styled(Stack)`
  align-items: flex-start;
  gap: 8px;
  ${sectionPadding};

  &:not(:last-of-type) {
    border-bottom: 1px solid ${PALETTE.SMOKE_MAIN};
  }

  .MuiSvgIcon-colorSecondary {
    color: ${PALETTE.SMOKE_DARK};
  }
`;
