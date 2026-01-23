import {
  ComponentConfig,
  EntityConfig,
  ListConfig,
} from "@databiosphere/findable-ui/lib/config/entities";
import { EXPLORE_MODE } from "@databiosphere/findable-ui/lib/hooks/useExploreMode/types";
import { HCAAtlasTrackerListValidationRecord } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  getTaskId,
  taskInputMapper,
} from "../../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import * as C from "../../../../../app/components";
import { mapSelectCategoryValue } from "../../../../../app/config/utils";
import { formatDateToQuarterYear } from "../../../../../app/utils/date-fns";
import * as V from "../../../../../app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "../../../category";
import { COLUMNS, ROW_PREVIEW_COLUMNS } from "./columns";
import { SAVED_FILTERS } from "./savedFilters";
import { TABLE_OPTIONS } from "./tableOptions";

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
              formatDateToQuarterYear,
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
    savedFilters: SAVED_FILTERS,
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
  label: "Reports",
  list: {
    columns: COLUMNS,
    tableOptions: TABLE_OPTIONS,
  } as ListConfig<HCAAtlasTrackerListValidationRecord>,
  listView: {
    disablePagination: true,
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
  ui: { title: "Reports" },
};
