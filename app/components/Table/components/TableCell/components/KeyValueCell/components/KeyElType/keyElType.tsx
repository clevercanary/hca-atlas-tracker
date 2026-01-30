import { JSX } from "react";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography, TypographyProps } from "@mui/material";

export const KeyElType = ({
  children,
  color = TYPOGRAPHY_PROPS.COLOR.INK_LIGHT,
  component = "div",
  variant = TYPOGRAPHY_PROPS.VARIANT.INHERIT,
  ...props /* MuiTypographyProps */
}: TypographyProps): JSX.Element => {
  return (
    <Typography
      color={color}
      component={component}
      variant={variant}
      {...props}
    >
      {children}
    </Typography>
  );
};
