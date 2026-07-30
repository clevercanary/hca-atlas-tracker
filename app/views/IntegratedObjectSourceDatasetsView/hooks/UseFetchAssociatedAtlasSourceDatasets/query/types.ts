import { AtlasId } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { INTEGRATED_OBJECT_ATLAS_SOURCE_DATASETS } from "./constants";

export type QueryKey = [
  typeof INTEGRATED_OBJECT_ATLAS_SOURCE_DATASETS,
  AtlasId | undefined,
];
