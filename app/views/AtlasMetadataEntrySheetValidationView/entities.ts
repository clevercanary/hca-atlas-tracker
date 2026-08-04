import {
  type HCAAtlasTrackerAtlas,
  type HCAAtlasTrackerEntrySheetValidation,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";

export type EntityData = {
  atlas: HCAAtlasTrackerAtlas | undefined;
  entrySheetValidation: HCAAtlasTrackerEntrySheetValidation | undefined;
};
