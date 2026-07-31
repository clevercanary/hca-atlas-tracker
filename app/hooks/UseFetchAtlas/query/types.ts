import { AtlasId } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { ATLAS } from "./constants";

export type QueryKey = [typeof ATLAS, AtlasId | undefined];
