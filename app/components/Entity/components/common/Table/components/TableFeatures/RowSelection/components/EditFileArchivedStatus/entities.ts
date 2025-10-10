import { Row, RowData, Table } from "@tanstack/react-table";

export interface Props<T extends RowData> {
  fetchKeys?: string[];
  rows: Row<T>[];
  table: Table<T>;
}
