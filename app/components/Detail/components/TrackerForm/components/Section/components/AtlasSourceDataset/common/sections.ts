import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasSourceDatasetEditData } from "../../../../../../../../../views/AtlasSourceDatasetView/common/entities";
import { SECTION_TITLES } from "../../../../../../../../Forms/common/constants";
import { SectionConfig } from "../../../../../../../../Forms/common/entities";
import * as C from "./constants";

export const VIEW_ATLAS_SOURCE_DATASET_SECTION_CONFIGS: SectionConfig<
  AtlasSourceDatasetEditData,
  HCAAtlasTrackerSourceDataset
>[] = [
  {
    controllerConfigs: C.METADATA_VIEW_ATLAS_SOURCE_DATASET_CONTROLLERS,
    sectionTitle: SECTION_TITLES.METADATA,
    showDivider: true,
  },
];
