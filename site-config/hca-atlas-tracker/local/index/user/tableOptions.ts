import {
  ListConfig,
  SORT_DIRECTION,
} from "@databiosphere/findable-ui/lib/config/entities";
import { HCAAtlasTrackerUser } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { HCA_ATLAS_TRACKER_CATEGORY_KEY } from "../../../category";

export const TABLE_OPTIONS: ListConfig<HCAAtlasTrackerUser>["tableOptions"] = {
  downloadFilename: "atlas-tracker-team",
  enableGrouping: true,
  enableRowPosition: true,
  enableTableDownload: true,
  initialState: {
    expanded: true,
    sorting: [
      {
        desc: SORT_DIRECTION.ASCENDING,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.FULL_NAME,
      },
    ],
  },
};
