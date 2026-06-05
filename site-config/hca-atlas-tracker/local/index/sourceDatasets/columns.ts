import { ColumnConfig } from "@databiosphere/findable-ui/lib/config/entities";
import { HCAAtlasTrackerListSourceDataset } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import * as COLUMN from "./column";

export const COLUMNS: ColumnConfig<HCAAtlasTrackerListSourceDataset>[] = [
  COLUMN.FILE_NAME,
  COLUMN.ATLASES,
  COLUMN.NETWORKS,
  COLUMN.VALIDATION_STATUS,
  COLUMN.CAP_INGEST_STATUS,
  COLUMN.RELEASE_DATE,
  COLUMN.DISEASE,
  COLUMN.ASSAY,
  COLUMN.TISSUE,
  COLUMN.SUSPENSION_TYPE,
  COLUMN.TIER1_VALIDATION_STATUS,
  COLUMN.CELL_COUNT,
];
