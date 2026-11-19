import { useFilterTable } from "@/app/views/AtlasStatusView/components/CurationReport/hooks/UseFilterTable/hook";
import { type AtlasIssue } from "@/app/views/AtlasStatusView/components/CurationReport/types";
import {
  type ColumnFiltersState,
  type OnChangeFn,
  type Table,
} from "@tanstack/react-table";
import { COLUMN_ID, COLUMNS } from "./constants";

/**
 * Table over the atlas's issue types, used only to drive the issue column filters.
 * @param issues - Issue types and publishing steps.
 * @param columnFilters - Column filters, held by the caller.
 * @param onColumnFiltersChange - Updates the column filters.
 * @returns Table instance, and the labels selected in the File and Kind filters.
 */
export const useIssueFilters = (
  issues: AtlasIssue[],
  columnFilters: ColumnFiltersState,
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>,
): {
  fileNames: string[];
  kindLabels: string[];
  table: Table<AtlasIssue>;
} => {
  const table = useFilterTable(
    issues,
    COLUMNS,
    (issue) => issue.key,
    columnFilters,
    onColumnFiltersChange,
  );
  return {
    fileNames: getFilterLabels(table, COLUMN_ID.FILE),
    kindLabels: getFilterLabels(table, COLUMN_ID.KIND),
    table,
  };
};

/**
 * Labels selected in a label column's filter.
 * @param table - Table instance.
 * @param columnId - Column id.
 * @returns Selected labels; empty when the filter is off.
 */
function getFilterLabels(table: Table<AtlasIssue>, columnId: string): string[] {
  // TanStack types filter values as unknown; label columns always hold string arrays.
  return (table.getColumn(columnId)?.getFilterValue() as string[]) ?? [];
}
