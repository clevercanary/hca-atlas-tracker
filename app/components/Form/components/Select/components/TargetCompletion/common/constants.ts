import { escapeRegExp } from "@databiosphere/findable-ui/lib/common/utils";

export const TARGET_COMPLETION_NULL = "TARGET_COMPLETION_NULL";

export const TARGET_COMPLETION_REGEXP = new RegExp(
  `^(?:${escapeRegExp(
    TARGET_COMPLETION_NULL
  )}|\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z)$`
);
