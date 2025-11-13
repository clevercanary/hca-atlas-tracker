import {
  InputBaseComponentProps,
  Chip as MChip,
  ChipProps as MChipProps,
} from "@mui/material";
import { forwardRef } from "react";

type ChipProps = InputBaseComponentProps & {
  viewProps?: MChipProps;
};

export const Chip = forwardRef<HTMLDivElement, ChipProps>(function Chip(
  { viewProps }: ChipProps,
  ref
): JSX.Element {
  return <MChip {...viewProps} ref={ref} />;
});
