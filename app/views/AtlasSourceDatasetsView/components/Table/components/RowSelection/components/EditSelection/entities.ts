import { AtlasSourceDataset } from "@/app/views/AtlasSourceDatasetsView/entities";
import { Row, Table } from "@tanstack/react-table";

export interface Props {
  rows: Row<AtlasSourceDataset>[];
  table: Table<AtlasSourceDataset>;
}
