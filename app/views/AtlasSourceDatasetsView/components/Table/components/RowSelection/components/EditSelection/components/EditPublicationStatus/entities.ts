import { Row, Table } from "@tanstack/react-table";
import { AtlasSourceDataset } from "../../../../../../../../entities";

export interface Props {
  closeMenu: () => void;
  rows: Row<AtlasSourceDataset>[];
  table: Table<AtlasSourceDataset>;
}
