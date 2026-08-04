import { Grid, type GridProps } from "@mui/material";
import { type JSX } from "react";

export const KeyValuesElType = ({
  ...props /* MuiGridProps */
}: GridProps): JSX.Element => {
  return <Grid {...props} container direction="column" gap={1} />;
};
