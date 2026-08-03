import {
  type AtlasId,
  type ComponentAtlasId,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type INTEGRATED_OBJECT_SOURCE_DATASETS } from "./constants";

export type QueryKey = [
  typeof INTEGRATED_OBJECT_SOURCE_DATASETS,
  AtlasId | undefined,
  ComponentAtlasId | undefined,
];
