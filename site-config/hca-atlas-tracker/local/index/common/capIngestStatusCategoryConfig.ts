import { CategoryConfig } from "@databiosphere/findable-ui/lib/common/categories/config/types";
import { CAP_INGEST_STATUS } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { CAP_INGEST_STATUS_LABEL } from "../../../../../app/components/Table/components/TableCell/components/CAPIngestStatusCell/constants";
import { mapSelectCategoryValue } from "../../../../../app/config/utils";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "../../../category";

export const CAP_INGEST_STATUS_CATEGORY_CONFIG: CategoryConfig = {
  key: HCA_ATLAS_TRACKER_CATEGORY_KEY.CAP_INGEST_STATUS,
  label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.CAP_INGEST_STATUS,
  mapSelectCategoryValue: mapSelectCategoryValue(
    (label) => CAP_INGEST_STATUS_LABEL[label as CAP_INGEST_STATUS] ?? label,
  ),
};
