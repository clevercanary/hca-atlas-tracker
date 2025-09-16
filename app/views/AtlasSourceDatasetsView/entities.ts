import {
  AtlasId,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../../apis/catalog/hca-atlas-tracker/common/entities";

export interface AtlasSourceDataset extends HCAAtlasTrackerSourceDataset {
  atlasId: AtlasId;
}

export type EntityData = {
  atlas: HCAAtlasTrackerAtlas | undefined;
  atlasSourceDatasets: AtlasSourceDataset[] | undefined;
};
