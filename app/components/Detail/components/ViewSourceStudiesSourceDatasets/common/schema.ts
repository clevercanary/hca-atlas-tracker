import { array, object, string } from "yup";
import { FIELD_NAME } from "./constants";

export const sourceStudiesSourceDatasetsEditSchema = object({
  [FIELD_NAME.SOURCE_DATASET_IDS]: array()
    .of(string().required().min(1))
    .default([]),
}).strict(true);
