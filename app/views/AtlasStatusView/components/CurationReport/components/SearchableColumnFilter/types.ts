import { type Column, type RowData } from "@tanstack/react-table";

export interface Props<T extends RowData> {
  column: Column<T>;
}

export interface SearchListProps<T extends RowData> extends Props<T> {
  filterValue: unknown[];
  sortedValues: [unknown, number][];
}
