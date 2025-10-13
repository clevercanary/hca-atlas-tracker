import { Table } from "@tanstack/react-table";
import { HCAAtlasTrackerComponentAtlas } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormManager } from "../../../../../../hooks/useFormManager/common/entities";

export interface UseIntegratedObjectsTable {
  access?: FormManager["access"];
  table: Table<HCAAtlasTrackerComponentAtlas>;
}
