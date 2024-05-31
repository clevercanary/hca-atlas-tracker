import {
  ComponentConfig,
  EntityConfig,
  ListConfig,
  SORT_DIRECTION,
} from "@databiosphere/findable-ui/lib/config/entities";
import { EXPLORE_MODE } from "@databiosphere/findable-ui/lib/hooks/useExploreMode";
import {
  HCAAtlasTrackerListValidationRecord,
  SYSTEM,
  TASK_STATUS,
} from "../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
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
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_NAMES,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ATLAS_NAMES,
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
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.DOI,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DOI,
          },
        ],
      },
    ],
    key: "tasks",
    savedFilters: [
      {
        filters: [
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
            value: ["Ingest source dataset."],
          },
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
            value: [TASK_STATUS.TODO],
          },
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.SYSTEM,
            value: [SYSTEM.CELLXGENE],
          },
        ],
        sort: {
          desc: SORT_DIRECTION.ASCENDING,
          id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TARGET_COMPLETION_DATE,
        },
        title: "CELLxGENE - Ingest backlog",
      },
      {
        filters: [
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
            value: [TASK_STATUS.DONE],
          },
        ],
        sort: {
          desc: SORT_DIRECTION.DESCENDING,
          id: HCA_ATLAS_TRACKER_CATEGORY_KEY.RESOLVED_AT,
        },
        title: "Completed Tasks",
      },
      {
        filters: [
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
            value: ["Ingest source dataset."],
          },
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
            value: [TASK_STATUS.TODO],
          },
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.SYSTEM,
            value: [SYSTEM.HCA_DATA_REPOSITORY],
          },
        ],
        sort: {
          desc: SORT_DIRECTION.ASCENDING,
          id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TARGET_COMPLETION_DATE,
        },
        title: "HCA Data Repository -  Ingest backlog",
      },
      {
        filters: [
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
            value: ["Add primary data."],
          },
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
            value: [TASK_STATUS.TODO],
          },
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.SYSTEM,
            value: [SYSTEM.HCA_DATA_REPOSITORY],
          },
        ],
        sort: {
          desc: SORT_DIRECTION.ASCENDING,
          id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TARGET_COMPLETION_DATE,
        },
        title: "HCA Data Repository - no primary data",
      },
      {
        filters: [
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
            value: ["Update project title to match publication title."],
          },
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
            value: [TASK_STATUS.TODO],
          },
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.SYSTEM,
            value: [SYSTEM.HCA_DATA_REPOSITORY],
          },
        ],
        sort: {
          desc: SORT_DIRECTION.ASCENDING,
          id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TARGET_COMPLETION_DATE,
        },
        title:
          "HCA Data Repository -  project title does not match publication title",
      },
    ],
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
          viewBuilder: V.buildTaskAtlasNames,
        } as ComponentConfig<
          typeof C.NTagCell,
          HCAAtlasTrackerListValidationRecord
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ATLAS_NAMES,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_NAMES,
        width: { max: "0.5fr", min: "120px" },
      },
      {
        componentConfig: {
          component: C.BioNetworkCell,
          viewBuilder: V.buildTaskBioNetworks,
        } as ComponentConfig<
          typeof C.BioNetworkCell,
          HCAAtlasTrackerListValidationRecord
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
          HCAAtlasTrackerListValidationRecord
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
          HCAAtlasTrackerListValidationRecord
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PUBLICATION_STRING,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.PUBLICATION_STRING,
        width: { max: "1fr", min: "220px" },
      },
      {
        columnVisible: false,
        componentConfig: {
          component: C.Link,
          viewBuilder: V.buildTaskDoi,
        } as ComponentConfig<
          typeof C.Link,
          HCAAtlasTrackerListValidationRecord
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DOI,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.DOI,
        width: { max: "1fr", min: "220px" },
      },
      {
        columnPinned: true,
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildTaskDescriptionSystem,
        } as ComponentConfig<
          typeof C.Cell,
          HCAAtlasTrackerListValidationRecord
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DESCRIPTION, // Task.
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
          HCAAtlasTrackerListValidationRecord
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
          HCAAtlasTrackerListValidationRecord
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
          HCAAtlasTrackerListValidationRecord
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
          HCAAtlasTrackerListValidationRecord
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
          HCAAtlasTrackerListValidationRecord
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TASK_STATUS,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
        width: { max: "0.5fr", min: "120px" },
      },
      {
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildTargetCompletion,
        } as ComponentConfig<
          typeof C.Cell,
          HCAAtlasTrackerListValidationRecord
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TARGET_COMPLETION_DATE,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TARGET_COMPLETION_DATE,
        width: { max: "0.65fr", min: "120px" },
      },
      {
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildResolvedAt,
        } as ComponentConfig<
          typeof C.Cell,
          HCAAtlasTrackerListValidationRecord
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.RESOLVED_AT,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.RESOLVED_AT,
        width: { max: "0.65fr", min: "120px" },
      },
      {
        columnVisible: false,
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildCreatedAt,
        } as ComponentConfig<
          typeof C.Cell,
          HCAAtlasTrackerListValidationRecord
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.CREATED_AT,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.CREATED_AT,
        width: { max: "0.65fr", min: "120px" },
      },
    ],
    defaultSort: {
      desc: SORT_DIRECTION.ASCENDING,
      id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_NAMES,
    },
  } as ListConfig<HCAAtlasTrackerListValidationRecord>,
  listView: {
    disablePagination: true,
    enableDownload: true,
    enableRowSelection: true,
    rowSelectionView: [
      {
        component: C.EditTasks,
        viewBuilder: V.buildEditTask,
      } as ComponentConfig<typeof C.EditTasks>,
    ],
  },
  route: "tasks",
};
