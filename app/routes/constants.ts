export const ROUTE = {
  ACCOUNT_DISABLED: "/account-disabled",
  ATLAS: "/atlases/[atlasId]",
  ATLASES: "/atlases",
  ATLAS_SOURCE_DATASET: "/atlases/[atlasId]/source-datasets/[sourceDatasetId]",
  ATLAS_SOURCE_DATASETS: "/atlases/[atlasId]/source-datasets",
  ATLAS_SOURCE_DATASET_VALIDATION:
    "/atlases/[atlasId]/source-datasets/[sourceDatasetId]/validations/[validatorName]",
  ATLAS_SOURCE_DATASET_VALIDATIONS:
    "/atlases/[atlasId]/source-datasets/[sourceDatasetId]/validations",
  COMPONENT_ATLAS: "/atlases/[atlasId]/integrated-objects/[componentAtlasId]",
  COMPONENT_ATLASES: "/atlases/[atlasId]/integrated-objects",
  CREATE_ATLAS: "/atlases/create",
  CREATE_SOURCE_STUDY: "/atlases/[atlasId]/source-studies/create",
  CREATE_USER: "/team/create",
  INTEGRATED_OBJECT_SOURCE_DATASETS:
    "/atlases/[atlasId]/integrated-objects/[componentAtlasId]/source-datasets",
  INTEGRATED_OBJECT_VALIDATION:
    "/atlases/[atlasId]/integrated-objects/[componentAtlasId]/validations/[validatorName]",
  INTEGRATED_OBJECT_VALIDATIONS:
    "/atlases/[atlasId]/integrated-objects/[componentAtlasId]/validations",
  LOGIN: "/login",
  METADATA_CORRECTNESS: "/atlases/[atlasId]/metadata-correctness",
  METADATA_ENTRY_SHEET:
    "/atlases/[atlasId]/metadata-entry-sheets/[entrySheetValidationId]",
  METADATA_ENTRY_SHEETS: "/atlases/[atlasId]/metadata-entry-sheets",
  REPORTS: "/reports",
  REQUESTING_ELEVATED_PERMISSIONS: "/requesting-elevated-permissions",
  SOURCE_DATASETS:
    "/atlases/[atlasId]/source-studies/[sourceStudyId]/source-datasets",
  SOURCE_STUDIES: "/atlases/[atlasId]/source-studies",
  SOURCE_STUDY: "/atlases/[atlasId]/source-studies/[sourceStudyId]",
  USER: "/team/[userId]",
  USERS: "/team",
  VALIDATING_ATLAS_SOURCE_STUDY_LIST: "/validating-atlas-source-study-list",
} as const;
