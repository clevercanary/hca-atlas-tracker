import {
  AtlasId,
  EntrySheetValidationId,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { ENTRY_SHEET_VALIDATION } from "./constants";

export type QueryKey = [
  typeof ENTRY_SHEET_VALIDATION,
  AtlasId | undefined,
  EntrySheetValidationId | undefined,
];
