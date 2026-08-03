import { type AtlasId } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type ATLAS } from "./constants";

export type QueryKey = [typeof ATLAS, AtlasId | undefined];
