import { escapeRegExp } from "@databiosphere/findable-ui/lib/common/utils";

export const CAP_ID_REGEXP = new RegExp(
  `^(?:${escapeRegExp("https://celltype.info/project/")}\\d+/dataset/\\d+)?$`
);
