import { HCAAtlasTrackerSourceStudy } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { Table } from "@tanstack/react-table";

export interface UseSourceStudiesTable {
  table: Table<HCAAtlasTrackerSourceStudy>;
}
