import {
  ComponentConfig,
  EntityConfig,
  ListConfig,
  SORT_DIRECTION,
} from "@databiosphere/findable-ui/lib/config/entities";
import { EXPLORE_MODE } from "@databiosphere/findable-ui/lib/hooks/useExploreMode";
import { HCAAtlasTrackerListAtlas } from "../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  atlasInputMapper,
  getAtlasId,
} from "../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import * as C from "../../../../app/components";
import { mapSelectCategoryValue } from "../../../../app/config/utils";
import { formatDateToQuarterYear } from "../../../../app/utils/date-fns";
import * as V from "../../../../app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "../../category";
import { subTitleHero } from "../viewList/subTitleHero";

/**
 * Entity config object responsible to config anything related to the /atlases route.
 */
export const atlasEntityConfig: EntityConfig = {
  apiPath: "api/atlases",
  categoryGroupConfig: {
    categoryGroups: [
      {
        categoryConfigs: [
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.NAME,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.NAME,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.BIONETWORK,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.BIONETWORK,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.INTEGRATION_LEAD,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.INTEGRATION_LEAD,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.PUBLICATION_STATUS,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PUBLICATION_STATUS,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.TARGET_COMPLETION_DATE,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TARGET_COMPLETION_DATE,
            mapSelectCategoryValue: mapSelectCategoryValue(
              formatDateToQuarterYear
            ),
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.WAVE,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.WAVE,
          },
        ],
      },
    ],
    key: "atlas",
  },
  detail: {
    detailOverviews: [],
    staticLoad: true,
    tabs: [],
    top: [],
  },
  entityMapper: atlasInputMapper,
  exploreMode: EXPLORE_MODE.SS_FETCH_CS_FILTERING,
  getId: getAtlasId,
  label: "Atlases",
  list: {
    columns: [
      {
        componentConfig: {
          component: C.Link,
          viewBuilder: V.buildAtlasName,
        } as ComponentConfig<typeof C.Link, HCAAtlasTrackerListAtlas>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.NAME,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.NAME,
        width: { max: "1fr", min: "160px" },
      },
      // {
      //   columnVisible: false,
      //   componentConfig: {
      //     component: C.Cell,
      //     viewBuilder: V.buildPublication,
      //   } as ComponentConfig<typeof C.Cell, HCAAtlasTrackerListAtlas>,
      //   header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PUBLICATION,
      //   id: HCA_ATLAS_TRACKER_CATEGORY_KEY.PUBLICATION,
      //   width: { max: "1fr", min: "136px" },
      // },
      {
        componentConfig: {
          component: C.BioNetworkCell,
          viewBuilder: V.buildBioNetwork,
        } as ComponentConfig<typeof C.BioNetworkCell, HCAAtlasTrackerListAtlas>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.BIONETWORK,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.BIONETWORK,
        width: { max: "1fr", min: "212px" },
      },
      {
        componentConfig: {
          component: C.BasicCell,
          viewBuilder: V.buildWave,
        } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerListAtlas>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.WAVE,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.WAVE,
        width: { max: "0.5fr", min: "112px" },
      },
      {
        componentConfig: {
          component: C.Link,
          viewBuilder: V.buildSourceStudyCount,
        } as ComponentConfig<typeof C.Link, HCAAtlasTrackerListAtlas>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.SOURCE_STUDY_COUNT,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.SOURCE_STUDY_COUNT,
        width: { max: "0.5fr", min: "112px" },
      },
      {
        componentConfig: {
          component: C.Link,
          viewBuilder: V.buildComponentAtlasCount,
        } as ComponentConfig<typeof C.Link, HCAAtlasTrackerListAtlas>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.COMPONENT_ATLAS_COUNT,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.COMPONENT_ATLAS_COUNT,
        width: { max: "0.5fr", min: "112px" },
      },
      {
        componentConfig: {
          component: C.NTagCell,
          viewBuilder: V.buildIntegrationLead,
        } as ComponentConfig<typeof C.NTagCell, HCAAtlasTrackerListAtlas>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.INTEGRATION_LEAD,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.INTEGRATION_LEAD,
        width: { max: "220px", min: "136px" },
      },
      {
        componentConfig: {
          component: C.StatusBadge,
          viewBuilder: V.buildStatus,
        } as ComponentConfig<typeof C.StatusBadge, HCAAtlasTrackerListAtlas>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PUBLICATION_STATUS,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.PUBLICATION_STATUS,
        width: { max: "128px", min: "128px" },
      },
      {
        componentConfig: {
          component: C.TaskCountsCell,
          viewBuilder: V.buildTaskCounts,
        } as ComponentConfig<typeof C.TaskCountsCell, HCAAtlasTrackerListAtlas>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TASK_COUNTS,
        width: { max: "128px", min: "128px" },
      },
      {
        componentConfig: {
          component: C.BasicCell,
          viewBuilder: V.buildTargetCompletion,
        } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerListAtlas>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TARGET_COMPLETION_DATE,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TARGET_COMPLETION_DATE,
        width: { max: "0.5fr", min: "168px" },
      },
    ],
    defaultSort: {
      desc: SORT_DIRECTION.ASCENDING,
      id: HCA_ATLAS_TRACKER_CATEGORY_KEY.NAME,
    },
  } as ListConfig<HCAAtlasTrackerListAtlas>,
  listView: {
    disablePagination: true,
    enableDownload: true,
    enableTab: false,
    subTitleHero,
  },
  route: "atlases",
};
