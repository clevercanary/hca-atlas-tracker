import { ATLAS_STATUS } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { GOOGLE_SHEETS_URL_OR_EMPTY_STRING_REGEX } from "@/app/apis/catalog/hca-atlas-tracker/common/schema";
import {
  TARGET_COMPLETION_NULL,
  TARGET_COMPLETION_REGEXP,
} from "@/app/components/Form/components/Select/components/TargetCompletion/common/constants";
import { newAtlasSchema } from "@/app/views/AddNewAtlasView/common/schema";
import { object, string } from "yup";
import { FIELD_NAME } from "./constants";

export const atlasEditSchema = newAtlasSchema.concat(
  object({
    [FIELD_NAME.METADATA_CORRECTNESS_URL]: string()
      .default("")
      .notRequired()
      .url("Metadata correctness report must be a URL"),
    [FIELD_NAME.METADATA_SPECIFICATION_URL]: string()
      .default("")
      .notRequired()
      .matches(
        GOOGLE_SHEETS_URL_OR_EMPTY_STRING_REGEX,
        'Metadata specification must be a Google Sheets URL of the form "https://docs.google.com/spreadsheets/d/..."',
      ),
    [FIELD_NAME.PUBLISHED_AT]: string(),
    [FIELD_NAME.STATUS]: string()
      .default("")
      .oneOf(Object.values(ATLAS_STATUS))
      .required(),
    [FIELD_NAME.TARGET_COMPLETION]: string()
      .matches(TARGET_COMPLETION_REGEXP)
      .default(TARGET_COMPLETION_NULL),
  }),
);
