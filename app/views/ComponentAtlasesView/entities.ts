import {
  type CAP_INGEST_STATUS,
  type HCAAtlasTrackerAtlas,
  type HCAAtlasTrackerComponentAtlas,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { type FormManager } from "@/app/hooks/useFormManager/common/entities";

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
