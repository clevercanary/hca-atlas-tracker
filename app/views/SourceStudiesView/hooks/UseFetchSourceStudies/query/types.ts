import { AtlasId } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { SOURCE_STUDIES } from "./constants";

export type QueryKey = [typeof SOURCE_STUDIES, AtlasId | undefined];
