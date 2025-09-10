import { object, string } from "yup";
import { FIELD_NAME } from "./constants";

export const viewAtlasSourceDatasetSchema = object({
  [FIELD_NAME.FILE_NAME]: string(),
  [FIELD_NAME.SIZE_BYTES]: string(),
  [FIELD_NAME.VALIDATION_STATUS]: string(),
});
