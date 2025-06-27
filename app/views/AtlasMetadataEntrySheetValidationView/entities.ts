import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerEntrySheetValidation,
} from "../../apis/catalog/hca-atlas-tracker/common/entities";

export type EntityData = {
  atlas: HCAAtlasTrackerAtlas | undefined;
  entrySheetValidation: HCAAtlasTrackerEntrySheetValidation | undefined;
};
