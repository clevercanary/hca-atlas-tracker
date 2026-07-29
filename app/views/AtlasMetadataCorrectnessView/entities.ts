import {
  HCAAtlasTrackerAtlas,
  Heatmap,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";

export type EntityData = {
  atlas: HCAAtlasTrackerAtlas | undefined;
  heatmap: Heatmap | undefined;
};
