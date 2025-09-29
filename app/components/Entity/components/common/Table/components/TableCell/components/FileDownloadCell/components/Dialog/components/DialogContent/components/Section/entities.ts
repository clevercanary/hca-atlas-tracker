import { TypographyOwnProps } from "@mui/material";
import { ReactNode } from "react";

export interface Props extends TypographyOwnProps {
  title?: ReactNode;
}
