import { type AtlasId } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type ATLAS_STATUS } from "./constants";

export type QueryKey = [typeof ATLAS_STATUS, AtlasId | undefined];
