import { HCAAtlasTrackerSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { Table } from "@tanstack/react-table";

export interface UseSourceDatasetsTable {
  table: Table<HCAAtlasTrackerSourceDataset>;
}
