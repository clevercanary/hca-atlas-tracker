import { ComponentConfig } from "@clevercanary/data-explorer-ui/lib/config/entities";
import * as C from "app/components";
import { HCAAtlasTrackerAtlas } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import * as V from "../../../../../app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";

export const sideColumn = [
  {
    children: [
      {
        component: C.OverviewSection,
        viewBuilder: V.buildAtlasOverviewPublication,
      } as ComponentConfig<typeof C.OverviewSection, HCAAtlasTrackerAtlas>,
      {
        component: C.OverviewSection,
        viewBuilder: V.buildAtlasOverviewCode,
      } as ComponentConfig<typeof C.OverviewSection, HCAAtlasTrackerAtlas>,
      {
        component: C.OverviewSection,
        viewBuilder: V.buildAtlasOverviewIntegrationLead,
      } as ComponentConfig<typeof C.OverviewSection, HCAAtlasTrackerAtlas>,
      {
        component: C.OverviewSection,
        viewBuilder: V.buildAtlasOverviewNetworkCoordinators,
      } as ComponentConfig<typeof C.OverviewSection, HCAAtlasTrackerAtlas>,
    ],
    component: C.Sections,
  } as ComponentConfig<typeof C.Sections>,
];
