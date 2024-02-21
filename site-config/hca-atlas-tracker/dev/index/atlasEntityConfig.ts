import {
  ComponentConfig,
  EntityConfig,
  ListConfig,
  SORT_DIRECTION,
} from "@clevercanary/data-explorer-ui/lib/config/entities";
import { EXPLORE_MODE } from "@clevercanary/data-explorer-ui/lib/hooks/useExploreMode";
import { HCAAtlasTrackerAtlas } from "../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasId } from "../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import * as C from "../../../../app/components";
import * as V from "../../../../app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "../../category";

export const PROJECT_ENTITY_ROUTE = {
  EXPORT_TO_TERRA: "export-to-terra",
  GET_CURL_COMMAND: "get-curl-command",
  OVERVIEW: "",
  PROJECT_MATRICES: "project-matrices",
  PROJECT_METADATA: "project-metadata",
};

/**
 * Entity config object responsible to config anything related to the /atlases route.
 */
export const atlasEntityConfig: EntityConfig = {
  apiPath: "api/entities/atlases",
  detail: {
    detailOverviews: [],
    staticLoad: true,
    tabs: [],
    top: [],
  },
  exploreMode: EXPLORE_MODE.SS_FETCH_CS_FILTERING,
  getId: getAtlasId,
  label: "Projects",
  list: {
    columns: [
      {
        componentConfig: {
          component: C.Link,
          viewBuilder: V.buildAtlasTitle,
        } as ComponentConfig<typeof C.Link, HCAAtlasTrackerAtlas>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ATLAS_TITLE,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_TITLE,
        width: { max: "2fr", min: "374px" },
      },
    ],
    defaultSort: {
      desc: SORT_DIRECTION.ASCENDING,
      id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_TITLE,
    },
  } as ListConfig<HCAAtlasTrackerAtlas>,
  route: "atlases",
};
