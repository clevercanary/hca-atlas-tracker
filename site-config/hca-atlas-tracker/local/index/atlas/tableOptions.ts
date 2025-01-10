import {
  ListConfig,
  SORT_DIRECTION,
} from "@databiosphere/findable-ui/lib/config/entities";
import { HCAAtlasTrackerListAtlas } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { HCA_ATLAS_TRACKER_CATEGORY_KEY } from "../../../category";

export const TABLE_OPTIONS: ListConfig<HCAAtlasTrackerListAtlas>["tableOptions"] =
  {
    enableGrouping: true,
    enableRowPosition: true,
    initialState: {
      columnVisibility: {
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.VERSION]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.WAVE]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.INTEGRATION_LEAD]: false,
      },
      expanded: true,
      sorting: [
        {
          desc: SORT_DIRECTION.ASCENDING,
          id: HCA_ATLAS_TRACKER_CATEGORY_KEY.NAME,
        },
      ],
    },
  };
