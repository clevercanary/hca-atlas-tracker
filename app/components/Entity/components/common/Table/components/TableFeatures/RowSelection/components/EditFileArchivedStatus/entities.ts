import { type QueryKey } from "@tanstack/react-query";
import { type Row, type RowData, type Table } from "@tanstack/react-table";

export interface Props<T extends RowData> {
  queryKeys?: QueryKey[];
  rows: Row<T>[];
  table: Table<T>;
}
