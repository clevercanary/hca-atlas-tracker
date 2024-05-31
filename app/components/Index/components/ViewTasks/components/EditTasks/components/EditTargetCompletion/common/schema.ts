import { array, object, string } from "yup";
import { TARGET_COMPLETION_REGEXP } from "../../../../../../../../Form/components/Select/components/TargetCompletion/common/constants";
import { FIELD_NAME } from "./constants";

export const taskCompletionDatesSchema = object({
  [FIELD_NAME.TARGET_COMPLETION]: string()
    .matches(TARGET_COMPLETION_REGEXP, "Target completion is required")
    .default("")
    .required(),
  [FIELD_NAME.TASK_IDS]: array(string().uuid().required())
    .default([])
    .required()
    .min(1),
}).strict(true);
