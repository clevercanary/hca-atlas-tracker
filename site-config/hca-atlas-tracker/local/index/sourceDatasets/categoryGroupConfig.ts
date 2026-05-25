import { FILE_VALIDATION_STATUS_NAME_LABEL } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { FILE_VALIDATION_STATUS } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
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
          key: HCA_ATLAS_TRACKER_CATEGORY_KEY.VALIDATION_STATUS,
          label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.VALIDATION_STATUS,
          mapSelectCategoryValue: mapSelectCategoryValue(
            (label) =>
              FILE_VALIDATION_STATUS_NAME_LABEL[
                label as FILE_VALIDATION_STATUS
              ] ?? label,
          ),
        },
      ],
      label: "",
    },
  ],
  key: "sourceDatasets",
};
