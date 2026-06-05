import { UNPUBLISHED } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { mapSelectCategoryValue } from "../../../../../app/config/utils";
import { SiteConfig } from "../../../../common/entities";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "../../../category";

export const CATEGORY_GROUP_CONFIG: SiteConfig["categoryGroupConfig"] = {
  categoryGroups: [
    {
      categoryConfigs: [
        {
          key: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_NAMES,
          label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ATLAS_NAMES,
        },
        {
          key: HCA_ATLAS_TRACKER_CATEGORY_KEY.NETWORKS,
          label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.NETWORKS,
        },
      ],
      label: "Biological Network",
    },
    {
      categoryConfigs: [
        {
          key: HCA_ATLAS_TRACKER_CATEGORY_KEY.JOURNAL,
          label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.JOURNAL,
          mapSelectCategoryValue: mapSelectCategoryValue(
            (val) => val || UNPUBLISHED,
          ),
        },
        {
          key: HCA_ATLAS_TRACKER_CATEGORY_KEY.PUBLICATION_STATUS,
          label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PUBLICATION_STATUS,
        },
      ],
      label: "Publication",
    },
    {
      categoryConfigs: [
        {
          key: HCA_ATLAS_TRACKER_CATEGORY_KEY.HCA_DATA_REPOSITORY,
          label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.HCA_DATA_REPOSITORY,
        },
      ],
      label: "Primary Data",
    },
  ],
  key: "sourceStudies",
};
