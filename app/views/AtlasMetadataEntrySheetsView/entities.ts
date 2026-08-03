import {
  type AtlasId,
  type HCAAtlasTrackerAtlas,
  type HCAAtlasTrackerListEntrySheetValidation,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";

export type EntityData = {
  atlas: HCAAtlasTrackerAtlas | undefined;
  entrySheets: MetadataEntrySheet[] | undefined;
};

export interface MetadataEntrySheet extends HCAAtlasTrackerListEntrySheetValidation {
  atlasId: AtlasId;
}
