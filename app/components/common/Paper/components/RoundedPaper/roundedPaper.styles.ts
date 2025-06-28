import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import { Paper } from "@mui/material";

export const StyledPaper = styled(Paper)`
  align-self: stretch;
  border: 1px solid ${PALETTE.SMOKE_MAIN};
  border-radius: 8px;
  overflow: hidden;
`;
