import { ErrorIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
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
      {error && (
        <ErrorIcon
          color={SVG_ICON_PROPS.COLOR.INHERIT}
          fontSize={SVG_ICON_PROPS.FONT_SIZE.XXSMALL}
        />
      )}
      <Typography component="span" noWrap={noWrap}>
        {children}
      </Typography>
    </HelperText>
  );
};
