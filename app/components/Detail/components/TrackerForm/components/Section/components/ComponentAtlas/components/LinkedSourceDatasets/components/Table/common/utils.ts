import { TABLE_GRID_TEMPLATE_COLUMNS } from "./constants";

/**
 * Returns the grid template columns for the table.
 * @param canEdit - Table can be edited.
 * @returns grid template columns.
 */
export function getGridTemplateColumns(canEdit: boolean): string {
  if (canEdit) {
    return TABLE_GRID_TEMPLATE_COLUMNS;
  }
  // Remove the last column (corresponds to the action column).
  const columns = TABLE_GRID_TEMPLATE_COLUMNS.split(" ");
  columns.pop();
  // Return the modified grid template columns value.
  return columns.join(" ");
}
