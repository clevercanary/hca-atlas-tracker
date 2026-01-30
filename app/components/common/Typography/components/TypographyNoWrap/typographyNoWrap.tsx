import { TypographyProps as MTypographyProps, Typography } from "@mui/material";
import { JSX, ReactNode } from "react";

export interface TypographyNoWrapProps extends MTypographyProps {
  children: ReactNode;
}

export const TypographyNoWrap = ({
  children,
  component = "span",
  ...props /* Spread props to allow for Typography specific props e.g. "color". */
}: TypographyNoWrapProps): JSX.Element => {
  return (
    <Typography component={component} noWrap {...props}>
      {children}
    </Typography>
  );
};
