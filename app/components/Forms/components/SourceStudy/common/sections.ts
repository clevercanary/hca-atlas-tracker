import { HCAAtlasTrackerSourceStudy } from "../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { NewSourceStudyData } from "../../../../../views/AddNewSourceStudyView/common/entities";
import { SourceStudyEditData } from "../../../../../views/SourceStudyView/common/entities";
import { GeneralInfo } from "../../../../Detail/components/TrackerForm/components/Section/components/SourceStudy/components/Add/components/GeneralInfo/generalInfo";
import { SECTION_TITLES } from "../../../common/constants";
import { SectionConfig } from "../../../common/entities";
import * as C from "./constants";

export const ADD_UNPUBLISHED_SOURCE_STUDY_SECTION_CONFIGS: SectionConfig<
  NewSourceStudyData,
  HCAAtlasTrackerSourceStudy
>[] = [
  {
    SectionCard: GeneralInfo,
    controllerConfigs: C.GENERAL_INFO_NEW_UNPUBLISHED_SOURCE_STUDY_CONTROLLERS,
    sectionTitle: SECTION_TITLES.GENERAL_INFORMATION,
    showDivider: true,
  },
];

export const ADD_PUBLISHED_SOURCE_STUDY_SECTION_CONFIGS: SectionConfig<
  NewSourceStudyData,
  HCAAtlasTrackerSourceStudy
>[] = [
  {
    SectionCard: GeneralInfo,
    controllerConfigs: C.GENERAL_INFO_NEW_PUBLISHED_SOURCE_STUDY_CONTROLLERS,
    sectionTitle: SECTION_TITLES.GENERAL_INFORMATION,
    showDivider: true,
  },
];

export const VIEW_UNPUBLISHED_SOURCE_STUDY_SECTION_CONFIGS: SectionConfig<
  SourceStudyEditData,
  HCAAtlasTrackerSourceStudy
>[] = [
  {
    controllerConfigs: C.GENERAL_INFO_VIEW_UNPUBLISHED_SOURCE_STUDY_CONTROLLERS,
    sectionTitle: SECTION_TITLES.GENERAL_INFORMATION,
  },
  {
    controllerConfigs:
      C.INTEGRATION_LEAD_VIEW_UNPUBLISHED_SOURCE_STUDY_CONTROLLERS,
    sectionTitle: SECTION_TITLES.INTEGRATION_LEAD,
  },
];

export const VIEW_PUBLISHED_SOURCE_STUDY_SECTION_CONFIGS: SectionConfig<
  SourceStudyEditData,
  HCAAtlasTrackerSourceStudy
>[] = [
  {
    controllerConfigs: C.GENERAL_INFO_VIEW_PUBLISHED_SOURCE_STUDY_CONTROLLERS,
    sectionTitle: SECTION_TITLES.GENERAL_INFORMATION,
  },
  {
    controllerConfigs:
      C.INTEGRATION_LEAD_VIEW_PUBLISHED_SOURCE_STUDY_CONTROLLERS,
    sectionTitle: SECTION_TITLES.INTEGRATION_LEAD,
  },
];
