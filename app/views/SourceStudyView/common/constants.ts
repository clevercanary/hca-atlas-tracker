import {
  FIELD_NAME as NEW_SOURCE_STUDY_FIELD_NAME,
  NO_DOI_FIELDS as NEW_SOURCE_STUDY_NO_DOI_FIELDS,
  PUBLISHED_PREPRINT_FIELDS as NEW_SOURCE_STUDY_PUBLISHED_PREPRINT_FIELDS,
} from "../../AddNewSourceStudyView/common/constants";
import { SourceStudyEditDataKeys } from "./entities";

export const FIELD_NAME = {
  ...NEW_SOURCE_STUDY_FIELD_NAME,
  CAP_ID: "capId",
  CELLXGENE_COLLECTION_ID: "cellxgeneCollectionId",
  HCA_PROJECT_ID: "hcaProjectId",
} as const;

export const NO_DOI_FIELDS: SourceStudyEditDataKeys[] = [
  ...NEW_SOURCE_STUDY_NO_DOI_FIELDS,
  FIELD_NAME.CAP_ID,
  FIELD_NAME.CELLXGENE_COLLECTION_ID,
  FIELD_NAME.HCA_PROJECT_ID,
];

export const PUBLISHED_PREPRINT_FIELDS: SourceStudyEditDataKeys[] = [
  ...NEW_SOURCE_STUDY_PUBLISHED_PREPRINT_FIELDS,
  FIELD_NAME.CAP_ID,
];
