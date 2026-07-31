import { QueryKey } from "@tanstack/react-query";
import { Row, RowData, Table } from "@tanstack/react-table";

export interface Props<T extends RowData> {
  queryKeys?: QueryKey[];
  rows: Row<T>[];
  table: Table<T>;
}
