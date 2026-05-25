import {
  EntityConfig,
  ListConfig,
} from "@databiosphere/findable-ui/lib/config/entities";
import { EXPLORE_MODE } from "@databiosphere/findable-ui/lib/hooks/useExploreMode/types";
import { HCAAtlasTrackerListSourceStudy } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  getSourceStudyId,
  sourceStudyInputMapper,
} from "../../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { CATEGORY_GROUP_CONFIG } from "./categoryGroupConfig";
import { COLUMNS } from "./columns";
import { TABLE_OPTIONS } from "./tableOptions";

/**
 * Entity config for the global /source-studies route — every source study across all atlases.
 */
export const sourceStudiesEntityConfig: EntityConfig = {
  apiPath: "api/source-studies",
  categoryGroupConfig: CATEGORY_GROUP_CONFIG,
  detail: {
    detailOverviews: [],
    staticLoad: true,
    tabs: [],
    top: [],
  },
  entityMapper: sourceStudyInputMapper,
  exploreMode: EXPLORE_MODE.SS_FETCH_CS_FILTERING,
  getId: getSourceStudyId,
  label: "Source Studies",
  list: {
    columns: COLUMNS,
    tableOptions: TABLE_OPTIONS,
  } as ListConfig<HCAAtlasTrackerListSourceStudy>,
  listView: { disablePagination: true },
  route: "source-studies",
  ui: { title: "Source Studies" },
};
