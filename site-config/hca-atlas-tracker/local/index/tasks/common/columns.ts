import { ColumnConfig } from "@databiosphere/findable-ui/lib/config/entities";
import { HCAAtlasTrackerListValidationRecord } from "../../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import * as COLUMN from "./column";

export const COLUMNS: ColumnConfig<HCAAtlasTrackerListValidationRecord>[] = [
  COLUMN.DESCRIPTION,
  COLUMN.SYSTEM,
  COLUMN.ATLAS_NAMES,
  COLUMN.NETWORKS,
  COLUMN.WAVES,
  COLUMN.PUBLICATION_STRING,
  COLUMN.DOI,
  COLUMN.ENTITY_TYPE,
  COLUMN.ENTITY_TITLE,
  COLUMN.VALIDATION_TYPE,
  COLUMN.TARGET_COMPLETION,
  COLUMN.TASK_STATUS,
  COLUMN.RESOLVED_AT,
  COLUMN.CREATED_AT,
];

export const ROW_PREVIEW_COLUMNS: ColumnConfig<HCAAtlasTrackerListValidationRecord>[] =
  [
    COLUMN.TASK_STATUS,
    COLUMN.SYSTEM,
    COLUMN.ATLAS_NAMES,
    COLUMN.NETWORKS,
    COLUMN.TARGET_COMPLETION,
    COLUMN.RESOLVED_AT,
    COLUMN.PUBLICATION_STRING,
    COLUMN.WAVES,
    COLUMN.DOI,
    COLUMN.ENTITY_TYPE,
    COLUMN.ENTITY_TITLE,
    COLUMN.VALIDATION_TYPE,
    COLUMN.CREATED_AT,
    COLUMN.RELATED_ENTITY_URL,
  ];
