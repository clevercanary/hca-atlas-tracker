import { type BaseComponentProps } from "@databiosphere/findable-ui/lib/components/types";
import { type RowData, type Table } from "@tanstack/react-table";

export interface Props<T extends RowData> extends BaseComponentProps {
  gridTemplateColumns?: string;
  stickyHeader?: boolean;
  table: Table<T>;
}
