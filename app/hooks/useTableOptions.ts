import {
  getCoreRowModel,
  RowData,
  RowSelectionState,
  TableOptions,
  Updater,
} from "@tanstack/table-core";
import { useCallback, useState } from "react";

export type PartialTableOptions<T extends RowData> = Partial<TableOptions<T>>;

export const useTableOptions = <T extends RowData>(
  tableOptions?: Partial<TableOptions<T>>
): PartialTableOptions<T> => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    initRowSelection(tableOptions)
  );

  const onRowSelectionChange = useCallback(
    (updater: Updater<RowSelectionState>): void => {
      setRowSelection(
        typeof updater === "function" ? updater(rowSelection) : updater
      );
    },
    [rowSelection]
  );

  return {
    ...tableOptions,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange,
    state: { rowSelection },
  };
};

/**
 * Initializes the row selection state.
 * @param tableOptions - Table options.
 * @returns initial row selection state.
 */
function initRowSelection<T extends RowData>(
  tableOptions?: Partial<TableOptions<T>>
): RowSelectionState {
  return tableOptions?.initialState?.rowSelection || {};
}
