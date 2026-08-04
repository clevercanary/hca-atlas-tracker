import { type BaseComponentProps } from "@databiosphere/findable-ui/lib/components/types";
import { type ChipProps } from "@mui/material";
import { type CellContext, type RowData } from "@tanstack/react-table";
import { type JSX } from "react";
import { StyledChipCell } from "./chipCell.styles";

export const ChipCell = <
  T extends RowData,
  TValue extends ChipProps = ChipProps,
>(
  props: BaseComponentProps & CellContext<T, TValue>,
): JSX.Element | null => {
  return <StyledChipCell {...props} />;
};
