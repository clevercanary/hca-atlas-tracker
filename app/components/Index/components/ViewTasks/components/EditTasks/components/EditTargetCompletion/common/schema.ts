import { array, object, string } from "yup";
import { FIELD_NAME } from "./constants";

export const taskCompletionDatesSchema = object({
  [FIELD_NAME.TARGET_COMPLETION]: string().datetime().default("").required(),
  [FIELD_NAME.TASK_IDS]: array(string().uuid().required())
    .default([])
    .required()
    .min(1),
}).strict(true);
