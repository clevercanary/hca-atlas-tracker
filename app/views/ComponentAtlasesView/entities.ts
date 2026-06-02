import {
  CAP_INGEST_STATUS,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerComponentAtlas,
} from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../common/entities";
import { FormManager } from "../../hooks/useFormManager/common/entities";

export interface AtlasIntegratedObject extends HCAAtlasTrackerComponentAtlas {
  atlasId: string;
  capIngestStatus: CAP_INGEST_STATUS;
}

export interface Entity {
  data: EntityData;
  formManager: FormManager;
  pathParameter: PathParameter;
}

export type EntityData = {
  atlas: HCAAtlasTrackerAtlas | undefined;
  integratedObjects: AtlasIntegratedObject[] | undefined;
};
