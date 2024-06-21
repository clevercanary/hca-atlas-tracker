import { SORT_DIRECTION } from "@databiosphere/findable-ui/lib/config/entities";
import { ColumnSort } from "@tanstack/table-core";
import { HCA_ATLAS_TRACKER_CATEGORY_KEY } from "../../../category";

export const SAVED_FILTERS_SORTING_TARGET_COMPLETION_DATE: ColumnSort[] = [
  {
    desc: SORT_DIRECTION.ASCENDING,
    id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TARGET_COMPLETION_DATE,
  },
  {
    desc: SORT_DIRECTION.ASCENDING,
    id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_NAMES,
  },
  {
    desc: SORT_DIRECTION.ASCENDING,
    id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
  },
];
