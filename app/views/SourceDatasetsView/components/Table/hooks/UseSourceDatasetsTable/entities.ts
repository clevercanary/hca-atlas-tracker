import { type HCAAtlasTrackerSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type Table } from "@tanstack/react-table";

export interface UseSourceDatasetsTable {
  table: Table<HCAAtlasTrackerSourceDataset>;
}
