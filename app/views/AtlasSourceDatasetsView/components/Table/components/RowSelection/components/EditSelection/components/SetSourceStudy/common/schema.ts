import { array, object, string } from "yup";
import { FIELD_NAME } from "./fields";

export const sourceStudyEditSchema = object({
  [FIELD_NAME.SOURCE_STUDY_ID]: string().nullable().default(null),
  [FIELD_NAME.SOURCE_DATASET_IDS]: array(string().uuid().required())
    .default([])
    .required()
    .min(1),
}).strict(true);
