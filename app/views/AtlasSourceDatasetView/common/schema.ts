import { object, string } from "yup";
import { CAP_DATASET_URL_REGEXP } from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import { FIELD_NAME } from "./constants";

export const viewAtlasSourceDatasetSchema = object({
  [FIELD_NAME.CAP_URL]: string()
    .default(null)
    .matches(CAP_DATASET_URL_REGEXP, "Invalid CAP URL (must be a dataset URL)")
    .nullable(),
  [FIELD_NAME.FILE_NAME]: string(),
  [FIELD_NAME.SIZE_BYTES]: string(),
  [FIELD_NAME.VALIDATION_STATUS]: string(),
}).strict(true);
