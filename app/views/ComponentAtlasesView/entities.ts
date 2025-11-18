import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerComponentAtlas,
} from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../common/entities";
import { CAP_INGEST_STATUS } from "../../components/Table/components/TableCell/components/CAPIngestStatusCell/entities";
import { FormManager } from "../../hooks/useFormManager/common/entities";

export interface AtlasIntegratedObject extends HCAAtlasTrackerComponentAtlas {
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
