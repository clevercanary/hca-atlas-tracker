import { Table } from "@tanstack/react-table";
import { HCAAtlasTrackerSourceDataset } from "app/apis/catalog/hca-atlas-tracker/common/entities";

export interface UseSourceDatasetsTable {
  table: Table<HCAAtlasTrackerSourceDataset>;
}
