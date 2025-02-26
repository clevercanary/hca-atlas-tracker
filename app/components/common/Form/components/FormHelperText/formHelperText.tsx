import { ErrorIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import {
  FormHelperTextProps as MFormHelperTextProps,
  Typography,
} from "@mui/material";
import { FormHelperText as HelperText } from "./formHelperText.styles";

export interface FormHelperTextProps extends MFormHelperTextProps {
  noWrap?: boolean;
}

export const FormHelperText = ({
  children,
  noWrap = true,
  ...props /* Spread props to allow for Mui FormHelperText specific prop overrides e.g. "filled". */
}: FormHelperTextProps): JSX.Element => {
  const { error } = props;
  return (
    <HelperText component="div" {...props}>
      {error && <ErrorIcon color="inherit" fontSize="xxsmall" />}
      <Typography component="span" noWrap={noWrap}>
        {children}
      </Typography>
    </HelperText>
  );
};
