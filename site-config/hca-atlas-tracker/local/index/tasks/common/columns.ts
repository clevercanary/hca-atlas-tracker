import { ColumnConfig } from "@databiosphere/findable-ui/lib/config/entities";
import { HCAAtlasTrackerListValidationRecord } from "../../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import * as COLUMN from "./column";

export const COLUMNS: ColumnConfig<HCAAtlasTrackerListValidationRecord>[] = [
  COLUMN.DESCRIPTION, // Task.
  COLUMN.PUBLICATION_STRING, // Source study.
  COLUMN.SYSTEM,
  COLUMN.ATLAS_NAMES,
  COLUMN.NETWORKS,
  COLUMN.WAVES,
  COLUMN.DOI,
  COLUMN.ENTITY_TYPE,
  COLUMN.ENTITY_TITLE,
  COLUMN.VALIDATION_TYPE,
  COLUMN.TASK_STATUS,
  COLUMN.TARGET_COMPLETION,
  COLUMN.CREATED_AT,
  COLUMN.RESOLVED_AT,
];

export const ROW_PREVIEW_COLUMNS: ColumnConfig<HCAAtlasTrackerListValidationRecord>[] =
  [
    COLUMN.PUBLICATION_STRING, // Source study.
    COLUMN.ENTITY_TITLE,
    COLUMN.DOI,
    COLUMN.SYSTEM,
    COLUMN.RELATED_ENTITY_URL, // Resource.
    COLUMN.TASK_STATUS,
    COLUMN.TARGET_COMPLETION,
    COLUMN.ATLAS_NAMES,
    COLUMN.NETWORKS,
    COLUMN.WAVES,
    COLUMN.ENTITY_TYPE,
    COLUMN.CREATED_AT,
    COLUMN.RESOLVED_AT,
  ];
