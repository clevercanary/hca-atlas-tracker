import {
  type AtlasId,
  type CAP_INGEST_STATUS,
  type HCAAtlasTrackerAtlas,
  type HCAAtlasTrackerLocalListSourceDataset,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { type FormManager } from "@/app/hooks/useFormManager/common/entities";

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
};
