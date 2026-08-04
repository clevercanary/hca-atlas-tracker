import {
  type AtlasId,
  type ComponentAtlasId,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type INTEGRATED_OBJECT } from "./constants";

export type QueryKey = [
  typeof INTEGRATED_OBJECT,
  AtlasId | undefined,
  ComponentAtlasId | undefined,
];
