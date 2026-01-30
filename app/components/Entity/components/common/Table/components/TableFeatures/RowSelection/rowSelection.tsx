import { JSX } from "react";
import { RowData } from "@tanstack/react-table";
import { Props } from "./entities";
import { StyledRowSelection } from "./rowSelection.styles";

export const RowSelection = <T extends RowData>({
  component,
  table,
}: Props<T>): JSX.Element | null => {
  const { getSelectedRowModel } = table;
  const selectedRowModel = getSelectedRowModel();
  const { rows } = selectedRowModel;

  if (rows.length === 0) return null;

  return (
    <StyledRowSelection
      rows={rows}
      rowSelectionView={[{ component, props: { rows, table } }]}
    />
  );
};
