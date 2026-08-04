import { type ComponentConfig } from "@databiosphere/findable-ui/lib/config/entities";
import { type RowData, type Table } from "@tanstack/react-table";

export interface Props<T extends RowData> {
  component: ComponentConfig["component"];
  table: Table<T>;
}
