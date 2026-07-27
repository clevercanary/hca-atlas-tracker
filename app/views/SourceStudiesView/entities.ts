import { HCAAtlasTrackerSourceStudy } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../common/entities";
import { FormManager } from "../../hooks/useFormManager/common/entities";

export interface Entity {
  data: EntityData;
  formManager: FormManager;
  pathParameter: PathParameter;
}

export type EntityData = {
  sourceStudies: HCAAtlasTrackerSourceStudy[] | undefined;
};
