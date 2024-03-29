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
import { atlasesMainColumn } from "../detail/atlas/atlasesMainColumn";
import { datasetsMainColumn } from "../detail/atlas/datasetsMainColumn";
import { mainColumn } from "../detail/atlas/overviewMainColumn";
import { sideColumn } from "../detail/atlas/overviewSideColumn";
import { top } from "../detail/atlas/top";

/**
 * Entity config object responsible to config anything related to the /atlases route.
 */
export const atlasEntityConfig: EntityConfig = {
  apiPath: "api/atlases",
  detail: {
    detailOverviews: [],
    staticLoad: true,
    tabs: [
      {
        label: "Overview",
        mainColumn: mainColumn,
        route: "",
        sideColumn: sideColumn,
      },
      {
        label: "Source Datasets",
        mainColumn: datasetsMainColumn,
        route: "datasets",
      },
      {
        label: "Component Atlases",
        mainColumn: atlasesMainColumn,
        route: "atlases",
      },
    ],
    top,
  },
  exploreMode: EXPLORE_MODE.SS_FETCH_CS_FILTERING,
  getId: getAtlasId,
  label: "Atlases",
  list: {
    columns: [
      {
        componentConfig: {
          component: C.AtlasCell,
          viewBuilder: V.buildAtlas,
        } as ComponentConfig<typeof C.AtlasCell, HCAAtlasTrackerAtlas>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ATLAS_TITLE,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_TITLE,
        width: { max: "2fr", min: "374px" },
      },
      {
        columnVisible: false,
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildPublication,
        } as ComponentConfig<typeof C.Cell, HCAAtlasTrackerAtlas>,
        disableHiding: true,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PUBLICATION,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.PUBLICATION,
        width: { max: "1fr", min: "136px" },
      },
      {
        componentConfig: {
          component: C.BioNetworkCell,
          viewBuilder: V.buildBioNetwork,
        } as ComponentConfig<typeof C.BioNetworkCell, HCAAtlasTrackerAtlas>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.BIONETWORK,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.BIONETWORK,
        width: { max: "1fr", min: "136px" },
      },
      {
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildVersion,
        } as ComponentConfig<typeof C.Cell, HCAAtlasTrackerAtlas>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.VERSION,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.VERSION,
        width: { max: "1fr", min: "136px" },
      },
      {
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildIntegrationLead,
        } as ComponentConfig<typeof C.Cell, HCAAtlasTrackerAtlas>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.INTEGRATION_LEAD,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.INTEGRATION_LEAD,
        width: { max: "1fr", min: "136px" },
      },
      {
        componentConfig: {
          component: C.StatusBadge,
          viewBuilder: V.buildStatus,
        } as ComponentConfig<typeof C.StatusBadge, HCAAtlasTrackerAtlas>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.STATUS,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.STATUS,
        width: { max: "1fr", min: "136px" },
      },
    ],
    defaultSort: {
      desc: SORT_DIRECTION.ASCENDING,
      id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_TITLE,
    },
  } as ListConfig<HCAAtlasTrackerAtlas>,
  listView: {
    disablePagination: true,
    enableDownload: true,
  },
  route: "atlases",
};
