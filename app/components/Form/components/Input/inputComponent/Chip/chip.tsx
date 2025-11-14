import { Chip as MChip } from "@mui/material";
import { forwardRef } from "react";
import { Props } from "./types";

export const Chip = forwardRef<HTMLDivElement, Props>(function Chip(
  { viewProps }: Props,
  ref
): JSX.Element {
  return <MChip {...viewProps} ref={ref} />;
});
