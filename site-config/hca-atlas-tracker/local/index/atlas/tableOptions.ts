import {
  ListConfig,
  SORT_DIRECTION,
} from "@databiosphere/findable-ui/lib/config/entities";
import { HCAAtlasTrackerListAtlas } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { HCA_ATLAS_TRACKER_CATEGORY_KEY } from "../../../category";

export const TABLE_OPTIONS: ListConfig<HCAAtlasTrackerListAtlas>["tableOptions"] =
  {
    downloadFilename: "atlas-tracker-atlases",
    enableGrouping: true,
    enableRowPosition: true,
    enableTableDownload: true,
    initialState: {
      columnVisibility: {
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.METADATA_SPECIFICATION_URL]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.VERSION]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.WAVE]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.SOURCE_DATASET_COUNT]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.SOURCE_STUDY_COUNT]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.COMPONENT_ATLAS_COUNT]: false,
      },
      expanded: true,
      grouping: [HCA_ATLAS_TRACKER_CATEGORY_KEY.TARGET_COMPLETION_DATE],
      sorting: [
        {
          desc: SORT_DIRECTION.ASCENDING,
          id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TARGET_COMPLETION_DATE,
        },
        {
          desc: SORT_DIRECTION.DESCENDING,
          id: HCA_ATLAS_TRACKER_CATEGORY_KEY.PUBLICATION_STATUS,
        },
        {
          desc: SORT_DIRECTION.ASCENDING,
          id: HCA_ATLAS_TRACKER_CATEGORY_KEY.NAME,
        },
      ],
    },
  };
