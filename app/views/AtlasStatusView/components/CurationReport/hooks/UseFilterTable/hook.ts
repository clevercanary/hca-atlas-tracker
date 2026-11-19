import { getFacetedUniqueValuesWithArrayValues } from "@databiosphere/findable-ui/lib/components/Table/common/utils";
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  type OnChangeFn,
  type RowData,
  type Table,
  useReactTable,
} from "@tanstack/react-table";

/**
 * Table used only to drive findable-ui column filters over a list of rows.
 * Array column values are faceted per item, so a row can carry several labels.
 * @param data - Rows.
 * @param columns - Filterable columns.
 * @param getRowId - Row id.
 * @param columnFilters - Column filters, held by the caller.
 * @param onColumnFiltersChange - Updates the column filters.
 * @returns Table instance.
 */
export const useFilterTable = <T extends RowData>(
  data: T[],
  columns: ColumnDef<T>[],
  getRowId: (row: T) => string,
  columnFilters: ColumnFiltersState,
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>,
): Table<T> => {
  return useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValuesWithArrayValues<T>(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId,
    onColumnFiltersChange,
    state: { columnFilters },
  });
};
