import { AtlasSourceDataset } from "@/app/views/AtlasSourceDatasetsView/entities";
import { Row, Table } from "@tanstack/react-table";

export interface Props {
  closeMenu: () => void;
  rows: Row<AtlasSourceDataset>[];
  table: Table<AtlasSourceDataset>;
}
