import { type HCAAtlasTrackerListSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { HCA_ATLAS_TRACKER_CATEGORY_KEY } from "@/site-config/hca-atlas-tracker/category";
import { type ListConfig } from "@databiosphere/findable-ui/lib/config/entities";

export const TABLE_OPTIONS: ListConfig<HCAAtlasTrackerListSourceDataset>["tableOptions"] =
  {
    initialState: {
      columnVisibility: {
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.ASSAY]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.DISEASE]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.SUSPENSION_TYPE]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.TIER1_VALIDATION_STATUS]: false,
        [HCA_ATLAS_TRACKER_CATEGORY_KEY.TISSUE]: false,
      },
    },
  };
