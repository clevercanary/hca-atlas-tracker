import { TableOptions } from "@tanstack/react-table";
import { MetadataEntrySheet } from "../../entities";

export interface Props {
  tableOptions: Omit<
    TableOptions<MetadataEntrySheet>,
    "data" | "getCoreRowModel"
  >;
}
