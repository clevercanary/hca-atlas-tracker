import { ColumnConfig } from "@databiosphere/findable-ui/lib/config/entities";
import { HCAAtlasTrackerListSourceStudy } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import * as COLUMN from "./column";

export const COLUMNS: ColumnConfig<HCAAtlasTrackerListSourceStudy>[] = [
  COLUMN.PUBLICATION_STRING,
  COLUMN.PUBLICATION,
  COLUMN.ATLASES,
  COLUMN.NETWORKS,
  COLUMN.SOURCE_DATASET_COUNT,
  COLUMN.HCA_DATA_REPOSITORY_STATUS,
  COLUMN.PUBLICATION_STATUS,
  COLUMN.JOURNAL,
];
