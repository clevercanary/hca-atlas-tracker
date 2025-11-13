import { InputBaseComponentProps, Chip as MChip } from "@mui/material";
import { forwardRef } from "react";

export const Chip = forwardRef<HTMLDivElement, InputBaseComponentProps>(
  function Chip(props: InputBaseComponentProps, ref): JSX.Element {
    return <MChip {...props.value} ref={ref} />;
  }
);
