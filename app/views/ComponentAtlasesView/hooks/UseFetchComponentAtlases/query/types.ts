import { type AtlasId } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type INTEGRATED_OBJECTS } from "./constants";

export type QueryKey = [
  typeof INTEGRATED_OBJECTS,
  AtlasId | undefined,
  boolean,
];
