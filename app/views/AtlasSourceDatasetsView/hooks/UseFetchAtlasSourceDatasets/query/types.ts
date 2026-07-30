import { AtlasId } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { SOURCE_DATASETS } from "./constants";

export type QueryKey = [typeof SOURCE_DATASETS, AtlasId | undefined, boolean];
