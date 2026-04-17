import { ChipProps, Chip as MChip } from "@mui/material";
import { JSX } from "react";

export function Chip(props: ChipProps): JSX.Element {
  return <MChip {...props} />;
}
