import { StyledGridEntityView } from "@databiosphere/findable-ui/lib/components/Index/index.styles";
import styled from "@emotion/styled";
import { Typography } from "@mui/material";

export const StyledGrid = styled(StyledGridEntityView)`
  margin: 0 auto;
  max-width: min(calc(100% - 32px), 1232px);

  .MuiGrid-root {
    padding: 0;
  }
`;

export const StyledTypography = styled(Typography)`
  margin-top: 16px;
`;
