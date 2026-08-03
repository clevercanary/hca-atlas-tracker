import { type MetadataEntrySheet } from "@/app/views/AtlasMetadataEntrySheetsView/entities";
import { type TableOptions } from "@tanstack/react-table";

export interface Props {
  tableOptions: Omit<
    TableOptions<MetadataEntrySheet>,
    "data" | "getCoreRowModel"
  >;
}
