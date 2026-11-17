import styled from "@emotion/styled";
import { Stack } from "@mui/material";

export const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const StyledHeading = styled(Stack)`
  align-items: baseline;
  column-gap: 12px;
  flex-flow: row wrap;
`;
