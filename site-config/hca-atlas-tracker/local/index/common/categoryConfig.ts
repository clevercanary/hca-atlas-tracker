import {
  FILE_VALIDATION_STATUS_NAME_LABEL,
  HCA_TIER1_VALIDATION_STATUS_LABEL,
} from "@/app/apis/catalog/hca-atlas-tracker/common/constants";
import {
  type CAP_INGEST_STATUS,
  type FILE_VALIDATION_STATUS,
  type HCA_TIER1_VALIDATION_STATUS,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { CAP_INGEST_STATUS_LABEL } from "@/app/components/Table/components/TableCell/components/CAPIngestStatusCell/constants";
import { mapSelectCategoryValue } from "@/app/config/utils";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "@/site-config/hca-atlas-tracker/category";
import { type CategoryConfig } from "@databiosphere/findable-ui/lib/common/categories/config/types";

export const CAP_INGEST_STATUS_CATEGORY_CONFIG: CategoryConfig = {
  key: HCA_ATLAS_TRACKER_CATEGORY_KEY.CAP_INGEST_STATUS,
  label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.CAP_INGEST_STATUS,
  mapSelectCategoryValue: mapSelectCategoryValue(
    (label) => CAP_INGEST_STATUS_LABEL[label as CAP_INGEST_STATUS] ?? label,
  ),
};

export const TIER1_VALIDATION_STATUS_CATEGORY_CONFIG: CategoryConfig = {
  key: HCA_ATLAS_TRACKER_CATEGORY_KEY.TIER1_VALIDATION_STATUS,
  label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TIER1_VALIDATION_STATUS,
  mapSelectCategoryValue: mapSelectCategoryValue(
    (label) =>
      HCA_TIER1_VALIDATION_STATUS_LABEL[label as HCA_TIER1_VALIDATION_STATUS] ??
      label,
  ),
};

export const VALIDATION_STATUS_CATEGORY_CONFIG: CategoryConfig = {
  key: HCA_ATLAS_TRACKER_CATEGORY_KEY.VALIDATION_STATUS,
  label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.VALIDATION_STATUS,
  mapSelectCategoryValue: mapSelectCategoryValue(
    (label) =>
      FILE_VALIDATION_STATUS_NAME_LABEL[label as FILE_VALIDATION_STATUS] ??
      label,
  ),
};
