import {
  ComponentConfig,
  EntityConfig,
  ListConfig,
  SORT_DIRECTION,
} from "@databiosphere/findable-ui/lib/config/entities";
import { EXPLORE_MODE } from "@databiosphere/findable-ui/lib/hooks/useExploreMode";
import { HCAAtlasTrackerListValidationResult } from "../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  getTaskId,
  taskInputMapper,
} from "../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import * as C from "../../../../app/components";
import * as V from "../../../../app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "../../category";

/**
 * Entity config object responsible to config anything related to the /tasks route.
 */
export const tasksEntityConfig: EntityConfig = {
  apiPath: "api/tasks",
  categoryGroupConfig: {
    categoryGroups: [
      {
        categoryConfigs: [
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DESCRIPTION,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.SYSTEM,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.SYSTEM,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.TARGET_COMPLETION_DATE,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TARGET_COMPLETION_DATE,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TASK_STATUS,
          },
        ],
      },
      {
        categoryConfigs: [
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_SHORT_NAMES,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ATLAS_SHORT_NAMES,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.NETWORKS,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.NETWORKS,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.WAVES,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.WAVES,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.PUBLICATION_STRING,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PUBLICATION_STRING,
          },
        ],
      },
    ],
    key: "tasks",
  },
  detail: {
    detailOverviews: [],
    staticLoad: true,
    tabs: [],
    top: [],
  },
  entityMapper: taskInputMapper,
  exploreMode: EXPLORE_MODE.SS_FETCH_CS_FILTERING,
  getId: getTaskId,
  label: "Tasks",
  list: {
    columns: [
      {
        componentConfig: {
          component: C.NTagCell,
          viewBuilder: V.buildTaskShortNames,
        } as ComponentConfig<
          typeof C.NTagCell,
          HCAAtlasTrackerListValidationResult
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ATLAS_SHORT_NAMES,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_SHORT_NAMES,
        width: { max: "0.5fr", min: "120px" },
      },
      {
        componentConfig: {
          component: C.BioNetworkCell,
          viewBuilder: V.buildTaskBioNetworks,
        } as ComponentConfig<
          typeof C.BioNetworkCell,
          HCAAtlasTrackerListValidationResult
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.NETWORKS,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.NETWORKS,
        width: { max: "1fr", min: "200px" },
      },
      {
        columnVisible: false,
        componentConfig: {
          component: C.NTagCell,
          viewBuilder: V.buildTaskWaves,
        } as ComponentConfig<
          typeof C.NTagCell,
          HCAAtlasTrackerListValidationResult
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.WAVES,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.WAVES,
        width: { max: "0.5fr", min: "68px" },
      },
      {
        componentConfig: {
          component: C.Link,
          viewBuilder: V.buildTaskPublicationString,
        } as ComponentConfig<
          typeof C.Link,
          HCAAtlasTrackerListValidationResult
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PUBLICATION_STRING,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.PUBLICATION_STRING,
        width: { max: "1fr", min: "220px" },
      },
      {
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildTaskDescriptionSystem,
        } as ComponentConfig<
          typeof C.Cell,
          HCAAtlasTrackerListValidationResult
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DESCRIPTION,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
        width: { max: "1fr", min: "220px" },
      },
      {
        columnVisible: false,
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildSystem,
        } as ComponentConfig<
          typeof C.Cell,
          HCAAtlasTrackerListValidationResult
        >,
        disableHiding: true,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.SYSTEM,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.SYSTEM,
        width: { max: "0.5fr", min: "220px" },
      },
      {
        columnVisible: false,
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildEntityType,
        } as ComponentConfig<
          typeof C.Cell,
          HCAAtlasTrackerListValidationResult
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ENTITY_TYPE,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ENTITY_TYPE,
        width: { max: "0.5fr", min: "200px" },
      },
      {
        columnVisible: false,
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildEntityTitle,
        } as ComponentConfig<
          typeof C.Cell,
          HCAAtlasTrackerListValidationResult
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ENTITY_TITLE,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ENTITY_TITLE,
        width: { max: "1fr", min: "220px" },
      },
      {
        columnVisible: false,
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildValidationType,
        } as ComponentConfig<
          typeof C.Cell,
          HCAAtlasTrackerListValidationResult
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.VALIDATION_TYPE, // Task Type.
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.VALIDATION_TYPE,
        width: { max: "0.5fr", min: "120px" },
      },
      {
        componentConfig: {
          component: C.StatusBadge,
          viewBuilder: V.buildTaskStatus,
        } as ComponentConfig<
          typeof C.StatusBadge,
          HCAAtlasTrackerListValidationResult
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TASK_STATUS,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
        width: { max: "0.5fr", min: "120px" },
      },
      {
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildTaskTargetCompletionDate,
        } as ComponentConfig<
          typeof C.Cell,
          HCAAtlasTrackerListValidationResult
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TARGET_COMPLETION_DATE,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TARGET_COMPLETION_DATE,
        width: { max: "0.65fr", min: "120px" },
      },
    ],
    defaultSort: {
      desc: SORT_DIRECTION.ASCENDING,
      id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_SHORT_NAMES,
    },
  } as ListConfig<HCAAtlasTrackerListValidationResult>,
  listView: {
    disablePagination: true,
    enableDownload: true,
  },
  route: "tasks",
};
