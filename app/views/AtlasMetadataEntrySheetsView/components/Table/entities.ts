import { MetadataEntrySheet } from "@/app/views/AtlasMetadataEntrySheetsView/entities";
import { TableOptions } from "@tanstack/react-table";

export interface Props {
  tableOptions: Omit<
    TableOptions<MetadataEntrySheet>,
    "data" | "getCoreRowModel"
  >;
}
