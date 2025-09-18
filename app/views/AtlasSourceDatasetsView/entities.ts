import {
  AtlasId,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../common/entities";

export interface AtlasSourceDataset extends HCAAtlasTrackerSourceDataset {
  atlasId: AtlasId;
}

export interface Entity {
  data: EntityData;
  pathParameter: PathParameter;
}

export type EntityData = {
  atlas: HCAAtlasTrackerAtlas | undefined;
  atlasSourceDatasets: AtlasSourceDataset[] | undefined;
};
