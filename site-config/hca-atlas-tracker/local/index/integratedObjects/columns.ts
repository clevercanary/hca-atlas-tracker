import { ColumnConfig } from "@databiosphere/findable-ui/lib/config/entities";
import { HCAAtlasTrackerListComponentAtlas } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import * as COLUMN from "./column";

export const COLUMNS: ColumnConfig<HCAAtlasTrackerListComponentAtlas>[] = [
  COLUMN.FILE_NAME,
  COLUMN.ATLASES,
  COLUMN.NETWORKS,
  COLUMN.VALIDATION_STATUS,
  COLUMN.CAP_INGEST_STATUS,
  COLUMN.RELEASE_DATE,
  COLUMN.SOURCE_DATASET_COUNT,
  COLUMN.DISEASE,
  COLUMN.ASSAY,
  COLUMN.TISSUE,
  COLUMN.SUSPENSION_TYPE,
  COLUMN.CELL_COUNT,
  COLUMN.TIER1_VALIDATION_STATUS,
];
