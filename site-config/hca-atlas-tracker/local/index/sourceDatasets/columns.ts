import { ColumnConfig } from "@databiosphere/findable-ui/lib/config/entities";
import { HCAAtlasTrackerGlobalSourceDataset } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import * as COLUMN from "./column";

export const COLUMNS: ColumnConfig<HCAAtlasTrackerGlobalSourceDataset>[] = [
  COLUMN.FILE_NAME,
  COLUMN.TITLE,
  COLUMN.ATLASES,
  COLUMN.NETWORKS,
  COLUMN.ASSAY,
  COLUMN.TISSUE,
  COLUMN.SUSPENSION_TYPE,
  COLUMN.CELL_COUNT,
  COLUMN.VALIDATION_STATUS,
];
