import { type AtlasId } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type ENTRY_SHEET_VALIDATIONS } from "./constants";

export type QueryKey = [typeof ENTRY_SHEET_VALIDATIONS, AtlasId | undefined];
