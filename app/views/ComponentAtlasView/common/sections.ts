import { HCAAtlasTrackerComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { SECTION_TITLES } from "../../../components/Forms/common/constants";
import { SectionConfig } from "../../../components/Forms/common/entities";
import { GENERAL_INFO_INTEGRATED_OBJECTS_CONTROLLERS } from "./controllers";
import { ComponentAtlasEditData } from "./entities";

export const VIEW_INTEGRATED_OBJECTS_SECTION_CONFIGS: SectionConfig<
  ComponentAtlasEditData,
  HCAAtlasTrackerComponentAtlas
>[] = [
  {
    controllerConfigs: GENERAL_INFO_INTEGRATED_OBJECTS_CONTROLLERS,
    sectionTitle: SECTION_TITLES.GENERAL_INFORMATION,
    showDivider: true,
  },
];
