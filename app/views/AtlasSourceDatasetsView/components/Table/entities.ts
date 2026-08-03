import { type AtlasSourceDataset } from "@/app/views/AtlasSourceDatasetsView/entities";
import { type TableOptions } from "@tanstack/react-table";

export interface Props {
  tableOptions: Omit<
    TableOptions<AtlasSourceDataset>,
    "data" | "getCoreRowModel"
  >;
}
