import { AtlasId } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METADATA_CORRECTNESS } from "./constants";

export type QueryKey = [typeof METADATA_CORRECTNESS, AtlasId | undefined];
