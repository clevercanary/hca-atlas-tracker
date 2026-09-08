import styled from "@emotion/styled";
import { Typography } from "@mui/material";

/**
 * The region is mounted whether or not it has a message, so the empty case
 * carries no margin: an error appearing is then the only thing that moves the
 * surrounding layout.
 */
export const StyledTypography = styled(Typography)`
  &:empty {
    margin: 0;
  }
`;
