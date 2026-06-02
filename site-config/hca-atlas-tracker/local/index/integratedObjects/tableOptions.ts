import { ListConfig } from "@databiosphere/findable-ui/lib/config/entities";
import { HCAAtlasTrackerListComponentAtlas } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { HCA_ATLAS_TRACKER_CATEGORY_KEY } from "../../../category";

export const TABLE_OPTIONS: ListConfig<HCAAtlasTrackerListComponentAtlas>["tableOptions"] =
  {
    initialState: {
      columnVisibility: {
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.DISEASE]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.SUSPENSION_TYPE]: false,
      },
    },
  };
