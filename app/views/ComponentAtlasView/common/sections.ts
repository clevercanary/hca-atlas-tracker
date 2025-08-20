import { HCAAtlasTrackerComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { SECTION_TITLES } from "../../../components/Forms/common/constants";
import { SectionConfig } from "../../../components/Forms/common/entities";
import { GENERAL_INFO_VIEW_COMPONENT_ATLAS_CONTROLLERS } from "./controllers";
import { ComponentAtlasViewData } from "./entities";

export const VIEW_COMPONENT_ATLAS_VIEW_SECTION_CONFIGS: SectionConfig<
  ComponentAtlasViewData,
  HCAAtlasTrackerComponentAtlas
>[] = [
  {
    controllerConfigs: GENERAL_INFO_VIEW_COMPONENT_ATLAS_CONTROLLERS,
    sectionTitle: SECTION_TITLES.GENERAL_INFORMATION,
    showDivider: true,
  },
];
