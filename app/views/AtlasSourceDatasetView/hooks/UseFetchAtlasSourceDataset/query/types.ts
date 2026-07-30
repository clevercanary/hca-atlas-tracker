import {
  AtlasId,
  SourceDatasetId,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { SOURCE_DATASET } from "./constants";

// Keyed on atlasId as well as sourceDatasetId: the fetch is atlas-scoped and a
// dataset can belong to multiple atlases, so the id alone would collide across
// atlases.
export type QueryKey = [
  typeof SOURCE_DATASET,
  AtlasId | undefined,
  SourceDatasetId | undefined,
];
