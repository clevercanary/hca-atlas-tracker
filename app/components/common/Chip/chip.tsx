import { type ChipProps, Chip as MChip } from "@mui/material";
import { type JSX } from "react";

export function Chip(props: ChipProps): JSX.Element {
  return <MChip {...props} />;
}
