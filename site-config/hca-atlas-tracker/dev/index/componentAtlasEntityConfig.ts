import {
  ComponentConfig,
  EntityConfig,
  ListConfig,
  SORT_DIRECTION,
} from "@clevercanary/data-explorer-ui/lib/config/entities";
import { EXPLORE_MODE } from "@clevercanary/data-explorer-ui/lib/hooks/useExploreMode";
import { HCAAtlasTrackerComponentAtlas } from "../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { getComponentAtlasId } from "../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import * as C from "../../../../app/components";
import * as V from "../../../../app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "../../category";
import { mainColumn } from "../detail/atlas/overviewMainColumn";

/**
 * Entity config object responsible to config anything related to the /component-atlases route.
 */
export const componentAtlasEntityConfig: EntityConfig = {
  apiPath: "api/entities/component-atlases",
  detail: {
    detailOverviews: [],
    staticLoad: true,
    tabs: [
      {
        label: "Overview",
        mainColumn: mainColumn,
        route: "",
      },
    ],
    top: [],
  },
  exploreMode: EXPLORE_MODE.SS_FETCH_CS_FILTERING,
  getId: getComponentAtlasId,
  label: "Component Atlases",
  list: {
    columns: [
      {
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildComponentAtlasName,
        } as ComponentConfig<typeof C.Cell, HCAAtlasTrackerComponentAtlas>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.COMPONENT_ATLAS_NAME,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.COMPONENT_ATLAS_NAME,
        width: { max: "2fr", min: "374px" },
      },
      {
        componentConfig: {
          component: C.NTagCell,
          viewBuilder: V.buildComponentAtlasTissue,
        } as ComponentConfig<typeof C.NTagCell, HCAAtlasTrackerComponentAtlas>,
        disableHiding: true,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TISSUE,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TISSUE,
        width: { max: "1fr", min: "136px" },
      },
      {
        componentConfig: {
          component: C.NTagCell,
          viewBuilder: V.buildComponentAtlasDisease,
        } as ComponentConfig<typeof C.NTagCell, HCAAtlasTrackerComponentAtlas>,
        disableHiding: true,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DISEASE,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.DISEASE,
        width: { max: "1fr", min: "136px" },
      },
      {
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildComponentAtlasCellCount,
        } as ComponentConfig<typeof C.Cell, HCAAtlasTrackerComponentAtlas>,
        disableHiding: true,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.CELL_COUNT,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.CELL_COUNT,
        width: { max: "1fr", min: "136px" },
      },
    ],
    defaultSort: {
      desc: SORT_DIRECTION.ASCENDING,
      id: HCA_ATLAS_TRACKER_CATEGORY_KEY.COMPONENT_ATLAS_NAME,
    },
  } as ListConfig<HCAAtlasTrackerComponentAtlas>,
  listView: {
    disablePagination: true,
  },
  route: "component-atlases",
};
