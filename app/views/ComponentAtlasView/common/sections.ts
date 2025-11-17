import { HCAAtlasTrackerComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { Chip } from "../../../components/Form/components/Input/inputComponent/Chip/chip";
import { SECTION_TITLES } from "../../../components/Forms/common/constants";
import { SectionConfig } from "../../../components/Forms/common/entities";
import {
  CAP_INTEGRATED_OBJECT_CONTROLLERS,
  GENERAL_INFO_INTEGRATED_OBJECT_CONTROLLERS,
} from "./controllers";
import { ViewIntegratedObjectData } from "./entities";

type ChipInputSectionConfig = SectionConfig<
  ViewIntegratedObjectData,
  HCAAtlasTrackerComponentAtlas,
  typeof Chip
>;

type CommonSectionConfig = SectionConfig<
  ViewIntegratedObjectData,
  HCAAtlasTrackerComponentAtlas
>;

export type IntegratedObjectSectionConfig =
  | ChipInputSectionConfig
  | CommonSectionConfig;

export const VIEW_INTEGRATED_OBJECT_SECTION_CONFIGS: IntegratedObjectSectionConfig[] =
  [
    {
      controllerConfigs: GENERAL_INFO_INTEGRATED_OBJECT_CONTROLLERS,
      sectionTitle: SECTION_TITLES.GENERAL_INFORMATION,
    },
    {
      controllerConfigs: CAP_INTEGRATED_OBJECT_CONTROLLERS,
      sectionTitle: SECTION_TITLES.CAP,
    },
  ];
