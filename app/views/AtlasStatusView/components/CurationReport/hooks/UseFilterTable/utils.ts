import { type ColumnDef, type Table } from "@tanstack/react-table";

/**
 * A filter-only column whose values are labels, matched by any selected label.
 * @param id - Column id.
 * @param header - Filter button label.
 * @param getLabels - Labels of a row.
 * @returns Column definition.
 */
export function labelColumn<T>(
  id: string,
  header: string,
  getLabels: (row: T) => string[],
): ColumnDef<T> {
  return { accessorFn: getLabels, filterFn: "arrIncludesSome", header, id };
}

/**
 * Rows left after the table's column filters.
 * @param table - Table instance.
 * @returns Filtered rows.
 */
export function getFilteredRows<T>(table: Table<T>): T[] {
  return table.getFilteredRowModel().rows.map(({ original }) => original);
}
