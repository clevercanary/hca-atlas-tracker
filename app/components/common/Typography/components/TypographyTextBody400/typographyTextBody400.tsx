import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import {
  type TypographyProps as MTypographyProps,
  Typography,
} from "@mui/material";
import { type JSX, type ReactNode } from "react";

export interface TypographyNoWrapProps extends MTypographyProps {
  children: ReactNode;
}

export const TypographyTextBody400 = ({
  children,
  component = "span",
  variant = TYPOGRAPHY_PROPS.VARIANT.BODY_400,
  ...props /* Spread props to allow for Typography specific props e.g. "color". */
}: TypographyNoWrapProps): JSX.Element => {
  return (
    <Typography component={component} variant={variant} {...props}>
      {children}
    </Typography>
  );
};
