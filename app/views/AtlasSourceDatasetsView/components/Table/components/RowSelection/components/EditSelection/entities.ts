import { Row, Table } from "@tanstack/react-table";
import { AtlasSourceDataset } from "../../../../../../entities";

export interface Props {
  rows: Row<AtlasSourceDataset>[];
  table: Table<AtlasSourceDataset>;
}
