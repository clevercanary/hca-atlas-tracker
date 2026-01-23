import { JSX } from "react";
import { BaseComponentProps } from "@databiosphere/findable-ui/lib/components/types";
import { ChipProps } from "@mui/material";
import { CellContext, RowData } from "@tanstack/react-table";
import { StyledChipCell } from "./chipCell.styles";

export const ChipCell = <
  T extends RowData,
  TValue extends ChipProps = ChipProps,
>(
  props: BaseComponentProps & CellContext<T, TValue>,
): JSX.Element | null => {
  return <StyledChipCell {...props} />;
};
