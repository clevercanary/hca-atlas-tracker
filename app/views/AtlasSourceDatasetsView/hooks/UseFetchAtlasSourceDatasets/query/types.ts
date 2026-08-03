import { type AtlasId } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type SOURCE_DATASETS } from "./constants";

export type QueryKey = [typeof SOURCE_DATASETS, AtlasId | undefined, boolean];
