import { SiteConfig } from "../../../../common/entities";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "../../../category";
import { VALIDATION_STATUS_CATEGORY_CONFIG } from "../common/validationStatusCategoryConfig";

export const CATEGORY_GROUP_CONFIG: SiteConfig["categoryGroupConfig"] = {
  categoryGroups: [
    {
      categoryConfigs: [
        {
          key: HCA_ATLAS_TRACKER_CATEGORY_KEY.NETWORKS,
          label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.NETWORKS,
        },
        {
          key: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_NAMES,
          label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ATLAS_NAMES,
        },
        {
          key: HCA_ATLAS_TRACKER_CATEGORY_KEY.ASSAY,
          label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ASSAY,
        },
        {
          key: HCA_ATLAS_TRACKER_CATEGORY_KEY.TISSUE,
          label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TISSUE,
        },
        {
          key: HCA_ATLAS_TRACKER_CATEGORY_KEY.SUSPENSION_TYPE,
          label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.SUSPENSION_TYPE,
        },
        {
          key: HCA_ATLAS_TRACKER_CATEGORY_KEY.DISEASE,
          label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DISEASE,
        },
        VALIDATION_STATUS_CATEGORY_CONFIG,
      ],
      label: "",
    },
  ],
  key: "integratedObjects",
};
