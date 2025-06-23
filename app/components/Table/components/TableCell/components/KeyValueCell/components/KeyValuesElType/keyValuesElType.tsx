import { Grid, GridProps } from "@mui/material";

export const KeyValuesElType = ({
  ...props /* MuiGridProps */
}: GridProps): JSX.Element => {
  return <Grid {...props} container direction="column" gap={1} />;
};
