import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerDetailComponentAtlas,
  HCAAtlasTrackerLocalListSourceDataset,
  HCAAtlasTrackerSourceDataset,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { FormManager } from "@/app/hooks/useFormManager/common/entities";

export interface Entity {
  data: EntityData;
  formManager: FormManager;
  pathParameter: PathParameter;
}

export interface EntityData {
  atlas?: HCAAtlasTrackerAtlas;
  atlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
  componentAtlas?: HCAAtlasTrackerDetailComponentAtlas;
  integratedObjectSourceDatasets?: IntegratedObjectSourceDataset[];
}

export interface IntegratedObjectSourceDataset extends HCAAtlasTrackerLocalListSourceDataset {
  atlasId: string;
}
