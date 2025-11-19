import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { Chip } from "../../../components/Form/components/Input/inputComponent/Chip/chip";
import { SECTION_TITLES } from "../../../components/Forms/common/constants";
import { SectionConfig } from "../../../components/Forms/common/entities";
import {
  CAP_SOURCE_DATASET_CONTROLLERS,
  GENERAL_INFO_SOURCE_DATASET_CONTROLLERS,
} from "./controllers";
import { ViewAtlasSourceDatasetData } from "./entities";

type ChipInputSectionConfig = SectionConfig<
  ViewAtlasSourceDatasetData,
  HCAAtlasTrackerSourceDataset,
  typeof Chip
>;

type CommonSectionConfig = SectionConfig<
  ViewAtlasSourceDatasetData,
  HCAAtlasTrackerSourceDataset
>;

export type SourceDatasetSectionConfig =
  | ChipInputSectionConfig
  | CommonSectionConfig;

export const VIEW_ATLAS_SOURCE_DATASET_SECTION_CONFIGS: SourceDatasetSectionConfig[] =
  [
    {
      controllerConfigs: GENERAL_INFO_SOURCE_DATASET_CONTROLLERS,
      sectionTitle: SECTION_TITLES.GENERAL_INFORMATION,
      showDivider: false,
    },
    {
      controllerConfigs: CAP_SOURCE_DATASET_CONTROLLERS,
      sectionTitle: SECTION_TITLES.CAP,
      showDivider: true,
    },
  ];
