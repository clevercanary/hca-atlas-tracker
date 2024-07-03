import {
  FIELD_NAME as NEW_SOURCE_STUDY_FIELD_NAME,
  PUBLISHED_FIELDS as NEW_SOURCE_STUDY_PUBLISHED_FIELDS,
  UNPUBLISHED_FIELDS as NEW_SOURCE_STUDY_UNPUBLISHED_FIELDS,
} from "../../AddNewSourceStudyView/common/constants";
import { SourceStudyEditDataKeys } from "./entities";

export const FIELD_NAME = {
  ...NEW_SOURCE_STUDY_FIELD_NAME,
  CAP_ID: "capId",
  CELLXGENE_COLLECTION_ID: "cellxgeneCollectionId",
  HCA_PROJECT_ID: "hcaProjectId",
} as const;

export const PUBLISHED_FIELDS: SourceStudyEditDataKeys[] = [
  ...NEW_SOURCE_STUDY_PUBLISHED_FIELDS,
  FIELD_NAME.CAP_ID,
];

export const UNPUBLISHED_FIELDS: SourceStudyEditDataKeys[] = [
  ...NEW_SOURCE_STUDY_UNPUBLISHED_FIELDS,
  FIELD_NAME.CAP_ID,
  FIELD_NAME.CELLXGENE_COLLECTION_ID,
  FIELD_NAME.HCA_PROJECT_ID,
];
