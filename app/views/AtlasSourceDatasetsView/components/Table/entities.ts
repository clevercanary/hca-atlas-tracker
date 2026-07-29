import { AtlasSourceDataset } from "@/app/views/AtlasSourceDatasetsView/entities";
import { TableOptions } from "@tanstack/react-table";

export interface Props {
  tableOptions: Omit<
    TableOptions<AtlasSourceDataset>,
    "data" | "getCoreRowModel"
  >;
}
