import {
  ComponentConfig,
  ComponentsConfig,
} from "@clevercanary/data-explorer-ui/lib/config/entities";
import { HCAAtlasTrackerAtlas } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import * as C from "../../../../../app/components";
import * as T from "../../../../../app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";

export const top: ComponentsConfig = [
  {
    component: C.BackPageHero,
    viewBuilder: T.buildAtlasHero,
  } as ComponentConfig<typeof C.BackPageHero, HCAAtlasTrackerAtlas>,
];
