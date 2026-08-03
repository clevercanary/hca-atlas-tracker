import { type AtlasSourceDataset } from "@/app/views/AtlasSourceDatasetsView/entities";
import { type Row, type Table } from "@tanstack/react-table";

export interface Props {
  closeMenu: () => void;
  rows: Row<AtlasSourceDataset>[];
  table: Table<AtlasSourceDataset>;
}
