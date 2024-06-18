import { CheckedIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/CheckedIcon/checkedIcon";
import { IndeterminateIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/IndeterminateIcon/indeterminateIcon";
import { UncheckedIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/UncheckedIcon/uncheckedIcon";
import {
  Checkbox as MCheckbox,
  FormControlLabel as DXFormControlLabel,
} from "@mui/material";
import { Row, RowData, Table } from "@tanstack/react-table";
import { RowSelectionState } from "@tanstack/table-core";
import { ChangeEvent, ReactNode, useCallback } from "react";

export interface GroupedRowSelectionCellProps<T extends RowData> {
  label?: ReactNode;
  row: Row<T>;
  table: Table<T>;
}

export const GroupedRowSelectionCell = <T extends RowData>({
  label,
  row,
  table,
}: GroupedRowSelectionCellProps<T>): JSX.Element => {
  const { setRowSelection } = table;
  const { getCanSelectSubRows, getIsAllSubRowsSelected, getIsSomeSelected } =
    row;

  const toggleSelectedHandler = useCallback(
    (row: Row<T>, _: ChangeEvent<HTMLInputElement>, checked: boolean): void => {
      const subRowSelectionState = getSubRowSelectionState(row, checked);
      setRowSelection?.((currentRowSelectionState) =>
        mergeAndParseRowSelectionState(
          currentRowSelectionState,
          subRowSelectionState
        )
      );
    },
    [setRowSelection]
  );

  return (
    <DXFormControlLabel
      control={
        <MCheckbox
          checked={getIsAllSubRowsSelected()}
          checkedIcon={<CheckedIcon />}
          disabled={!getCanSelectSubRows()}
          icon={<UncheckedIcon />}
          indeterminate={getIsSomeSelected()}
          indeterminateIcon={<IndeterminateIcon />}
          onChange={toggleSelectedHandler.bind(null, row)}
        />
      }
      label={label}
    />
  );
};

/**
 * Returns the sub row selection state.
 * @param row - Row.
 * @param checked - Checked.
 * @returns sub row selection state.
 */
function getSubRowSelectionState<T extends RowData>(
  row: Row<T>,
  checked: boolean
): RowSelectionState {
  return row.subRows.reduce((acc, { getCanSelect, id }) => {
    if (getCanSelect()) {
      return { ...acc, [id]: checked };
    }
    return acc;
  }, {} as RowSelectionState);
}

/**
 * Merges two row selection states and filters out falsy values.
 * @param currentRowSelection - Current row selection state.
 * @param subRowSelection - Sub row selection state.
 * @returns merged row selection state.
 */
function mergeAndParseRowSelectionState(
  currentRowSelection: RowSelectionState,
  subRowSelection: RowSelectionState
): RowSelectionState {
  return Object.entries({ ...currentRowSelection, ...subRowSelection }).reduce(
    (acc, [key, value]) => {
      if (!value) {
        return acc;
      }
      return { ...acc, [key]: value };
    },
    {} as RowSelectionState
  );
}
