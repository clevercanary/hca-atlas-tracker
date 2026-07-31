import {
  AtlasId,
  SourceStudyId,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { SOURCE_STUDY } from "./constants";

// Keyed on atlasId as well as sourceStudyId: the fetch is atlas-scoped
// (getSourceStudy computes an atlas-scoped sourceDatasetCount) and a study can
// belong to multiple atlases, so the id alone would collide across atlases.
export type QueryKey = [
  typeof SOURCE_STUDY,
  AtlasId | undefined,
  SourceStudyId | undefined,
];
