import { array, object, string } from "yup";
import { FIELD_NAME } from "./fields";

export const reprocessedStatusEditSchema = object({
  [FIELD_NAME.REPROCESSED_STATUS]: string().default("").required(),
  [FIELD_NAME.SOURCE_DATASET_IDS]: array(string().uuid().required())
    .default([])
    .required()
    .min(1),
}).strict(true);
