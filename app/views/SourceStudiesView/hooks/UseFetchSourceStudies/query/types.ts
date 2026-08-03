import { type AtlasId } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type SOURCE_STUDIES } from "./constants";

export type QueryKey = [typeof SOURCE_STUDIES, AtlasId | undefined];
