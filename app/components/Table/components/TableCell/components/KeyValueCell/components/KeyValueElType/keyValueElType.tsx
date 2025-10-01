import { KeyValueElTypeProps } from "@databiosphere/findable-ui/lib/components/common/KeyValuePairs/components/KeyValueElType/keyValueElType";
import { Grid, GridProps } from "@mui/material";

export const KeyValueElType = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `keyValue` is accepted for compatibility but not used.
  keyValue,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `keyValueFn` is accepted for compatibility but not used.
  keyValueFn,
  ...props /* MuiGridProps */
}: GridProps &
  Pick<KeyValueElTypeProps, "keyValue" | "keyValueFn">): JSX.Element => {
  return <Grid {...props} container direction="row" gap={1} />;
};
