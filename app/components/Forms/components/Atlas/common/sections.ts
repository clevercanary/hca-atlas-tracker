import { HCAAtlasTrackerAtlas } from "../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { NewAtlasData } from "../../../../../views/AddNewAtlasView/common/entities";
import { AtlasEditData } from "../../../../../views/AtlasView/common/entities";
import { SECTION_TITLES } from "../../../common/constants";
import { SectionConfig } from "../../../common/entities";
import * as C from "./constants";

export const ADD_ATLAS_SECTION_CONFIGS: SectionConfig<
  NewAtlasData,
  HCAAtlasTrackerAtlas
>[] = [
  {
    controllerConfigs: C.GENERAL_INFO_NEW_ATLAS_CONTROLLERS,
    sectionTitle: SECTION_TITLES.GENERAL_INFORMATION,
    showDivider: true,
  },
  {
    controllerConfigs: C.INTEGRATION_LEAD_NEW_ATLAS_CONTROLLERS,
    sectionTitle: SECTION_TITLES.INTEGRATION_LEAD,
  },
];

export const VIEW_ATLAS_SECTION_CONFIGS: SectionConfig<
  AtlasEditData,
  HCAAtlasTrackerAtlas
>[] = [
  {
    controllerConfigs: C.GENERAL_INFO_VIEW_ATLAS_CONTROLLERS,
    sectionTitle: SECTION_TITLES.GENERAL_INFORMATION,
  },
  {
    controllerConfigs: C.INTEGRATION_LEAD_VIEW_ATLAS_CONTROLLERS,
    sectionTitle: SECTION_TITLES.INTEGRATION_LEAD,
  },
];
