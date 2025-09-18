import { TableOptions } from "@tanstack/react-table";
import { AtlasSourceDataset } from "../../entities";

export interface Props {
  tableOptions: Omit<
    TableOptions<AtlasSourceDataset>,
    "data" | "getCoreRowModel"
  >;
}
