import { escapeRegExp } from "@databiosphere/findable-ui/lib/common/utils";
import { array, object, string } from "yup";
import { FIELD_NAME, TARGET_COMPLETION_NULL } from "./constants";

const TARGET_COMPLETION_REGEXP = new RegExp(
  `^(?:${escapeRegExp(
    TARGET_COMPLETION_NULL
  )}|\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z)$`
);

export const taskCompletionDatesSchema = object({
  [FIELD_NAME.TARGET_COMPLETION]: string()
    .matches(TARGET_COMPLETION_REGEXP)
    .default("")
    .required(),
  [FIELD_NAME.TASK_IDS]: array(string().uuid().required())
    .default([])
    .required()
    .min(1),
}).strict(true);
