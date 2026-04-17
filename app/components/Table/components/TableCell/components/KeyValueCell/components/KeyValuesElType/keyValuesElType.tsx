import { Grid, GridProps } from "@mui/material";
import { JSX } from "react";

export const KeyValuesElType = ({
  ...props /* MuiGridProps */
}: GridProps): JSX.Element => {
  return <Grid {...props} container direction="column" gap={1} />;
};
