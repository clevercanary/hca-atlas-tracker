import { Chip as MChip } from "@mui/material";
import { type JSX, forwardRef } from "react";
import { type Props } from "./types";

export const Chip = forwardRef<HTMLDivElement, Props>(function Chip(
  { viewProps }: Props,
  ref,
): JSX.Element {
  return <MChip {...viewProps} ref={ref} />;
});
