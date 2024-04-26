import { FIELD_NAME as NEW_SOURCE_DATASET_FIELD_NAME } from "../../AddNewSourceDatasetView/common/constants";

export const FIELD_NAME = {
  ...NEW_SOURCE_DATASET_FIELD_NAME,
  CELLXGENE_COLLECTION_ID: "cellxgeneCollectionId",
  HCA_PROJECT_ID: "hcaProjectId",
} as const;
