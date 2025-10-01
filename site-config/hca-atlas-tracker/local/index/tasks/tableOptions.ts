import {
  ListConfig,
  SORT_DIRECTION,
} from "@databiosphere/findable-ui/lib/config/entities";
import { HCAAtlasTrackerListValidationRecord } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { HCA_ATLAS_TRACKER_CATEGORY_KEY } from "../../../category";

export const TABLE_OPTIONS: ListConfig<HCAAtlasTrackerListValidationRecord>["tableOptions"] =
  {
    downloadFilename: "atlas-tracker-reports",
    enableExpanding: true,
    enableGrouping: true,
    enableMultiRowSelection: true,
    enableRowPosition: true,
    enableRowPreview: true,
    enableRowSelection: (row) => !row.getIsGrouped(),
    enableTableDownload: true,
    initialState: {
      columnVisibility: {
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.RELATED_ENTITY_URL]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_VERSIONS]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.CREATED_AT]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.ENTITY_TITLE]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.ENTITY_TYPE]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.NETWORKS]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.UPDATED_AT]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.WAVES]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.VALIDATION_TYPE]: false,
      },
      expanded: true,
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
  };
