import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import { Box } from "@mui/material";

export const StyledBox = styled(Box)`
  align-items: center;
  align-self: stretch;
  color: ${PALETTE.COMMON_WHITE};
  display: flex;
  flex: 1;
  justify-content: center;
  padding: 8px 12px;
`;
