import { Typography } from "@mui/material";
import { ReactNode } from "react";

export interface TypographyNoWrapProps {
  children: ReactNode;
}

export const TypographyNoWrap = ({
  children,
  ...props /* Spread props to allow for Typography specific props e.g. "color". */
}: TypographyNoWrapProps): JSX.Element => {
  return (
    <Typography component="span" noWrap {...props}>
      {children}
    </Typography>
  );
};
