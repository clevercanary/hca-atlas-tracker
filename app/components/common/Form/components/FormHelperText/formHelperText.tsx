import { ErrorIcon } from "@clevercanary/data-explorer-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import {
  FormHelperTextProps as MFormHelperTextProps,
  Typography,
} from "@mui/material";
import { FormHelperText as HelperText } from "./formHelperText.styles";

export const FormHelperText = ({
  children,
  ...props /* Spread props to allow for Mui FormHelperText specific prop overrides e.g. "filled". */
}: MFormHelperTextProps): JSX.Element => {
  const { error } = props;
  return (
    <HelperText component="div" {...props}>
      {error && <ErrorIcon color="inherit" fontSize="xxsmall" />}
      <Typography component="span" noWrap>
        {children}
      </Typography>
    </HelperText>
  );
};
