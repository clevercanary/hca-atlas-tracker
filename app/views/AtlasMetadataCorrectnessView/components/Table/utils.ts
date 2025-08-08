import { RowData, Table } from "@tanstack/react-table";
import { TABLE_CONFIG } from "./constants";

/**
 * Get the column track sizing for the table.
 * @param table - Table.
 * @returns Column track sizing.
 */
export function getColumnTrackSizing(table: Table<RowData>): string {
  // First column is a fixed width.
  const firstColumnWidth = TABLE_CONFIG.FIRST_COLUMN_WIDTH;

  // Calculate minimum width for attribute columns; additional columns are scrollable.
  const attributeColumnCount = table.getVisibleFlatColumns().length - 1;
  const availableWidth = TABLE_CONFIG.AVAILABLE_WIDTH;
  const maxVisibleColumns = TABLE_CONFIG.AVAILABLE_COLUMN_COUNT;
  const minAttributeWidth = availableWidth / maxVisibleColumns;

  return `${firstColumnWidth}px repeat(${attributeColumnCount}, minmax(${minAttributeWidth}px, 1fr))`;
}
