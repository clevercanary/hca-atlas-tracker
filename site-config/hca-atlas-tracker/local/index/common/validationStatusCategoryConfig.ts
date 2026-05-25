import { CategoryConfig } from "@databiosphere/findable-ui/lib/common/categories/config/types";
import { FILE_VALIDATION_STATUS_NAME_LABEL } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { FILE_VALIDATION_STATUS } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { mapSelectCategoryValue } from "../../../../../app/config/utils";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "../../../category";

export const VALIDATION_STATUS_CATEGORY_CONFIG: CategoryConfig = {
  key: HCA_ATLAS_TRACKER_CATEGORY_KEY.VALIDATION_STATUS,
  label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.VALIDATION_STATUS,
  mapSelectCategoryValue: mapSelectCategoryValue(
    (label) =>
      FILE_VALIDATION_STATUS_NAME_LABEL[label as FILE_VALIDATION_STATUS] ??
      label,
  ),
};
