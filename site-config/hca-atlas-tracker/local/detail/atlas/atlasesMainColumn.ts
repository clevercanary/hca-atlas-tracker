import { ComponentConfig } from "@clevercanary/data-explorer-ui/lib/config/entities";
import * as C from "app/components";
import { HCAAtlasTrackerAtlas } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import * as V from "../../../../../app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";

export const atlasesMainColumn = [
  {
    children: [
      {
        component: C.DetailViewTable,
        viewBuilder: V.buildAtlasDetailViewComponentAtlasesTable,
      } as ComponentConfig<typeof C.DetailViewTable, HCAAtlasTrackerAtlas>,
    ],
    component: C.BackPageContentSingleColumn,
  } as ComponentConfig<typeof C.BackPageContentSingleColumn>,
];
