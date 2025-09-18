import { EditSelection } from "./components/EditSelection/editSelection";
import { Props } from "./entities";
import { StyledRowSelection } from "./rowSelection.styles";

export const RowSelection = ({ table }: Props): JSX.Element | null => {
  const { getSelectedRowModel } = table;
  const selectedRowModel = getSelectedRowModel();
  const { rows } = selectedRowModel;

  if (rows.length === 0) return null;

  return (
    <StyledRowSelection
      rows={rows}
      rowSelectionView={[{ component: EditSelection, props: { rows, table } }]}
    />
  );
};
