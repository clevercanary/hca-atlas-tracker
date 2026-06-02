import {
  EntityConfig,
  ListConfig,
} from "@databiosphere/findable-ui/lib/config/entities";
import { EXPLORE_MODE } from "@databiosphere/findable-ui/lib/hooks/useExploreMode/types";
import { HCAAtlasTrackerListSourceDataset } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  getSourceDatasetId,
  sourceDatasetInputMapper,
} from "../../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { CATEGORY_GROUP_CONFIG } from "./categoryGroupConfig";
import { COLUMNS } from "./columns";
import { TABLE_OPTIONS } from "./tableOptions";

/**
 * Entity config for the global /source-datasets route — every source dataset across all atlases.
 */
export const sourceDatasetsEntityConfig: EntityConfig = {
  apiPath: "api/source-datasets",
  categoryGroupConfig: CATEGORY_GROUP_CONFIG,
  detail: {
    detailOverviews: [],
    staticLoad: true,
    tabs: [],
    top: [],
  },
  entityMapper: sourceDatasetInputMapper,
  exploreMode: EXPLORE_MODE.SS_FETCH_CS_FILTERING,
  getId: getSourceDatasetId,
  label: "Source Datasets",
  list: {
    columns: COLUMNS,
    tableOptions: TABLE_OPTIONS,
  } as ListConfig<HCAAtlasTrackerListSourceDataset>,
  listView: { disablePagination: true },
  route: "source-datasets",
  ui: { title: "Source Datasets" },
};
