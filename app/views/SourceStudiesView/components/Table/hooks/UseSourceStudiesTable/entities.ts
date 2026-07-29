import { Table } from "@tanstack/react-table";
import { HCAAtlasTrackerSourceStudy } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

export interface UseSourceStudiesTable {
  table: Table<HCAAtlasTrackerSourceStudy>;
}
