import {
  EntityConfig,
  ListConfig,
} from "@databiosphere/findable-ui/lib/config/entities";
import { EXPLORE_MODE } from "@databiosphere/findable-ui/lib/hooks/useExploreMode/types";
import { HCAAtlasTrackerGlobalComponentAtlas } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  componentAtlasInputMapper,
  getComponentAtlasId,
} from "../../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { CATEGORY_GROUP_CONFIG } from "./categoryGroupConfig";
import { COLUMNS } from "./columns";
import { TABLE_OPTIONS } from "./tableOptions";

/**
 * Entity config for the global /integrated-objects route — every integrated object across all atlases.
 */
export const integratedObjectsEntityConfig: EntityConfig = {
  apiPath: "api/component-atlases",
  categoryGroupConfig: CATEGORY_GROUP_CONFIG,
  detail: {
    detailOverviews: [],
    staticLoad: true,
    tabs: [],
    top: [],
  },
  entityMapper: componentAtlasInputMapper,
  exploreMode: EXPLORE_MODE.SS_FETCH_CS_FILTERING,
  getId: getComponentAtlasId,
  label: "Integrated Objects",
  list: {
    columns: COLUMNS,
    tableOptions: TABLE_OPTIONS,
  } as ListConfig<HCAAtlasTrackerGlobalComponentAtlas>,
  listView: { disablePagination: true },
  route: "integrated-objects",
  ui: { title: "Integrated Objects" },
};
