import { FormLabelProps as MFormLabelProps } from "@mui/material";
import { FormLabel as Label } from "./formLabel.styles";

export const FormLabel = ({
  children,
  ...props /* Spread props to allow for Mui FormLabel specific prop overrides e.g. "filled". */
}: MFormLabelProps): JSX.Element => {
  return <Label {...props}>{children}</Label>;
};
