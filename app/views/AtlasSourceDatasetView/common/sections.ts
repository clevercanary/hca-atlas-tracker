import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { SECTION_TITLES } from "../../../components/Forms/common/constants";
import { SectionConfig } from "../../../components/Forms/common/entities";
import { GENERAL_INFO_SOURCE_DATASET_CONTROLLERS } from "./controllers";
import { ViewAtlasSourceDatasetData } from "./entities";

export const VIEW_ATLAS_SOURCE_DATASET_SECTION_CONFIGS: SectionConfig<
  ViewAtlasSourceDatasetData,
  HCAAtlasTrackerSourceDataset
>[] = [
  {
    controllerConfigs: GENERAL_INFO_SOURCE_DATASET_CONTROLLERS,
    sectionTitle: SECTION_TITLES.GENERAL_INFORMATION,
    showDivider: true,
  },
];
