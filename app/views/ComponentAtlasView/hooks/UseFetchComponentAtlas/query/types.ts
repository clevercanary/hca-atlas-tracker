import {
  AtlasId,
  ComponentAtlasId,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { INTEGRATED_OBJECT } from "./constants";

export type QueryKey = [
  typeof INTEGRATED_OBJECT,
  AtlasId | undefined,
  ComponentAtlasId | undefined,
];
