import {
  AtlasId,
  SourceStudyId,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { SOURCE_STUDY_SOURCE_DATASETS } from "./constants";

export type QueryKey = [
  typeof SOURCE_STUDY_SOURCE_DATASETS,
  AtlasId | undefined,
  SourceStudyId | undefined,
];
