import { HCAAtlasTrackerAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/entities";

export type AtlasBase = Omit<
  HCAAtlasTrackerAtlas,
  "componentAtlases" | "description" | "sourceDatasets"
>;
