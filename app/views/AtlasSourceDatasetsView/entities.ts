import {
  AtlasId,
  CAP_INGEST_STATUS,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerLocalListSourceDataset,
  HCAAtlasTrackerSourceStudy,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { FormManager } from "@/app/hooks/useFormManager/common/entities";

export interface AtlasSourceDataset extends HCAAtlasTrackerLocalListSourceDataset {
  atlasId: AtlasId;
  capIngestStatus: CAP_INGEST_STATUS;
}

export interface Entity {
  data: EntityData;
  formManager: FormManager;
  pathParameter: PathParameter;
}

export type EntityData = {
  atlas: HCAAtlasTrackerAtlas | undefined;
  atlasSourceDatasets: AtlasSourceDataset[] | undefined;
  sourceStudies: HCAAtlasTrackerSourceStudy[] | undefined;
};
