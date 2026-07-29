import { HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { SECTION_TITLES } from "@/app/components/Forms/common/constants";
import { SectionConfig } from "@/app/components/Forms/common/entities";
import { NewAtlasData } from "@/app/views/AddNewAtlasView/common/entities";
import { AtlasEditData } from "@/app/views/AtlasView/common/entities";
import { NewAtlasIntegrationLeadSection } from "../components/NewAtlasIntegrationLeadSection/newAtlasIntegrationLeadSection";
import { ViewAtlasIntegrationLeadSection } from "../components/ViewAtlasIntegrationLeadSection/viewAtlasIntegrationLeadSection";
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
    controllerConfigs: C.IDENTIFIERS_NEW_ATLAS_CONTROLLERS,
    sectionTitle: SECTION_TITLES.IDENTIFIERS,
  },
  {
    SectionCard: NewAtlasIntegrationLeadSection,
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
    controllerConfigs: C.IDENTIFIERS_VIEW_ATLAS_CONTROLLERS,
    sectionTitle: SECTION_TITLES.IDENTIFIERS,
  },
  {
    SectionCard: ViewAtlasIntegrationLeadSection,
    sectionTitle: SECTION_TITLES.INTEGRATION_LEAD,
  },
  {
    controllerConfigs: C.METADATA_VIEW_ATLAS_CONTROLLERS,
    sectionTitle: SECTION_TITLES.METADATA,
  },
];
