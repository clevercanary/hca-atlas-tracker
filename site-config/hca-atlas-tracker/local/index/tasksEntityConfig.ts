import {
  ComponentConfig,
  EntityConfig,
  ListConfig,
  SORT_DIRECTION,
} from "@databiosphere/findable-ui/lib/config/entities";
import { EXPLORE_MODE } from "@databiosphere/findable-ui/lib/hooks/useExploreMode";
import { HCAAtlasTrackerValidationResult } from "../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { getTaskId } from "../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
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
  detail: {
    detailOverviews: [],
    staticLoad: true,
    tabs: [],
    top: [],
  },
  exploreMode: EXPLORE_MODE.SS_FETCH_CS_FILTERING,
  getId: getTaskId,
  label: "Tasks",
  list: {
    columns: [
      {
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildSystem,
        } as ComponentConfig<typeof C.Cell, HCAAtlasTrackerValidationResult>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.SYSTEM,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.SYSTEM,
        width: { max: "0.5fr", min: "220px" },
      },
      {
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildEntityType,
        } as ComponentConfig<typeof C.Cell, HCAAtlasTrackerValidationResult>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ENTITY_TYPE,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ENTITY_TYPE,
        width: { max: "0.5fr", min: "200px" },
      },
      {
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildEntityTitle,
        } as ComponentConfig<typeof C.Cell, HCAAtlasTrackerValidationResult>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ENTITY_TITLE,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ENTITY_TITLE,
        width: { max: "1fr", min: "240px" },
      },
      {
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildValidationType,
        } as ComponentConfig<typeof C.Cell, HCAAtlasTrackerValidationResult>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.VALIDATION_TYPE, // Task Type.
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.VALIDATION_TYPE,
        width: { max: "0.5fr", min: "120px" },
      },
      {
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildTaskDescription,
        } as ComponentConfig<typeof C.Cell, HCAAtlasTrackerValidationResult>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DESCRIPTION,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
        width: { max: "1fr", min: "240px" },
      },
      {
        componentConfig: {
          component: C.StatusBadge,
          viewBuilder: V.buildTaskStatus,
        } as ComponentConfig<
          typeof C.StatusBadge,
          HCAAtlasTrackerValidationResult
        >,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.STATUS,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.STATUS,
        width: { max: "0.5fr", min: "120px" },
      },
    ],
    defaultSort: {
      desc: SORT_DIRECTION.ASCENDING,
      id: HCA_ATLAS_TRACKER_CATEGORY_KEY.SYSTEM,
    },
  } as ListConfig<HCAAtlasTrackerValidationResult>,
  listView: {
    disablePagination: true,
    enableDownload: true,
  },
  route: "tasks",
};
