import {
  ComponentConfig,
  EntityConfig,
  ListConfig,
  SORT_DIRECTION,
} from "@databiosphere/findable-ui/lib/config/entities";
import { EXPLORE_MODE } from "@databiosphere/findable-ui/lib/hooks/useExploreMode";
import { VALIDATION_DESCRIPTION } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import {
  HCAAtlasTrackerListValidationRecord,
  SYSTEM,
  TASK_STATUS,
} from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  getTaskId,
  taskInputMapper,
} from "../../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import * as C from "../../../../../app/components";
import { COLUMN_VISIBILITY } from "../../../../../app/components/Table/features/constants";
import { mapSelectCategoryValue } from "../../../../../app/config/utils";
import { formatDateToQuarterYear } from "../../../../../app/utils/date-fns";
import * as V from "../../../../../app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "../../../category";
import { SAVED_FILTERS_SORTING_TARGET_COMPLETION_DATE } from "../common/constants";
import { COLUMNS, ROW_PREVIEW_COLUMNS } from "./common/columns";

/**
 * Entity config object responsible to config anything related to the /reports route.
 */
export const tasksEntityConfig: EntityConfig = {
  apiPath: "api/tasks",
  categoryGroupConfig: {
    categoryGroups: [
      {
        categoryConfigs: [
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TASK_STATUS,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.SYSTEM,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.SYSTEM,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.TARGET_COMPLETION_DATE,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TARGET_COMPLETION_DATE,
            mapSelectCategoryValue: mapSelectCategoryValue(
              formatDateToQuarterYear
            ),
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DESCRIPTION,
          },
        ],
        label: "Task",
      },
      {
        categoryConfigs: [
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_NAMES,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ATLAS_NAMES,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_VERSIONS,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ATLAS_VERSIONS,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.NETWORKS,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.NETWORKS,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.WAVES,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.WAVES,
          },
        ],
        label: "Atlas",
      },
      {
        categoryConfigs: [
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.DOI,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DOI,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.PUBLICATION_STRING,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PUBLICATION_STRING,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.ENTITY_TITLE,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ENTITY_TITLE,
          },
        ],
        label: "Study",
      },
    ],
    key: "tasks",
    savedFilters: [
      {
        filters: [
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
            value: [VALIDATION_DESCRIPTION.INGEST_SOURCE_STUDY],
          },
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
            value: [TASK_STATUS.TODO, TASK_STATUS.BLOCKED],
          },
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.SYSTEM,
            value: [SYSTEM.CAP],
          },
        ],
        sorting: SAVED_FILTERS_SORTING_TARGET_COMPLETION_DATE,
        title: "CAP - Ingest backlog",
      },
      {
        filters: [
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
            value: [VALIDATION_DESCRIPTION.INGEST_SOURCE_STUDY],
          },
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
            value: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.TODO],
          },
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.SYSTEM,
            value: [SYSTEM.CELLXGENE],
          },
        ],
        sorting: SAVED_FILTERS_SORTING_TARGET_COMPLETION_DATE,
        title: "CELLxGENE - Ingest backlog",
      },
      {
        filters: [
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
            value: [TASK_STATUS.DONE],
          },
        ],
        sorting: [
          {
            desc: SORT_DIRECTION.DESCENDING,
            id: HCA_ATLAS_TRACKER_CATEGORY_KEY.RESOLVED_AT,
          },
        ],
        title: "Completed Tasks",
      },
      {
        filters: [
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
            value: [VALIDATION_DESCRIPTION.INGEST_SOURCE_STUDY],
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
        sorting: SAVED_FILTERS_SORTING_TARGET_COMPLETION_DATE,
        title: "HCA Data Repository -  Ingest backlog",
      },
      {
        filters: [
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
            value: [VALIDATION_DESCRIPTION.ADD_PRIMARY_DATA],
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
        sorting: SAVED_FILTERS_SORTING_TARGET_COMPLETION_DATE,
        title: "HCA Data Repository - no primary data",
      },
      {
        filters: [
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
            value: [VALIDATION_DESCRIPTION.UPDATE_TITLE_TO_MATCH_PUBLICATION],
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
        sorting: SAVED_FILTERS_SORTING_TARGET_COMPLETION_DATE,
        title:
          "HCA Data Repository -  project title does not match publication title",
      },
      {
        filters: [
          {
            categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
            value: [
              VALIDATION_DESCRIPTION.LINK_PROJECT_BIONETWORKS_AND_ATLASES,
            ],
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
        sorting: SAVED_FILTERS_SORTING_TARGET_COMPLETION_DATE,
        title: "HCA Data Repository - Missing Network or Atlas",
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
  explorerTitle: "Reports",
  getId: getTaskId,
  label: "Reports",
  list: {
    columns: COLUMNS,
    tableOptions: {
      enableExpanding: true,
      enableGrouping: true,
      enableMultiSort: true,
      initialState: {
        columnVisibility: COLUMN_VISIBILITY.ROW_POSITION,
        expanded: true,
        grouping: [HCA_ATLAS_TRACKER_CATEGORY_KEY.TARGET_COMPLETION_DATE],
        sorting: [
          {
            desc: SORT_DIRECTION.ASCENDING,
            id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TARGET_COMPLETION_DATE,
          },
          {
            desc: SORT_DIRECTION.ASCENDING,
            id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_NAMES,
          },
        ],
      },
    },
  } as ListConfig<HCAAtlasTrackerListValidationRecord>,
  listView: {
    disablePagination: true,
    enableDownload: true,
    enableRowPreview: true,
    enableRowSelection: true,
    enableTab: false,
    rowPreviewView: [
      {
        children: [
          {
            component: C.PreviewTask,
            viewBuilder: (model) =>
              V.buildTaskPreviewDetails(model, ROW_PREVIEW_COLUMNS),
          } as ComponentConfig<typeof C.PreviewTask>,
        ],
        component: C.RowDrawer<HCAAtlasTrackerListValidationRecord>,
        viewBuilder: V.buildTaskRowPreview,
      } as ComponentConfig<
        typeof C.RowDrawer<HCAAtlasTrackerListValidationRecord>
      >,
    ],
    rowSelectionView: [
      {
        component: C.EditTasks,
        viewBuilder: V.buildEditTask,
      } as ComponentConfig<typeof C.EditTasks>,
    ],
  },
  route: "reports",
};
