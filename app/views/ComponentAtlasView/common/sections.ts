import { HCAAtlasTrackerComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { SECTION_TITLES } from "../../../components/Forms/common/constants";
import { SectionConfig } from "../../../components/Forms/common/entities";
import { GENERAL_INFO_INTEGRATED_OBJECT_CONTROLLERS } from "./controllers";
import { ViewIntegratedObjectData } from "./entities";

export const VIEW_INTEGRATED_OBJECT_SECTION_CONFIGS: SectionConfig<
  ViewIntegratedObjectData,
  HCAAtlasTrackerComponentAtlas
>[] = [
  {
    controllerConfigs: GENERAL_INFO_INTEGRATED_OBJECT_CONTROLLERS,
    sectionTitle: SECTION_TITLES.GENERAL_INFORMATION,
    showDivider: true,
  },
];
