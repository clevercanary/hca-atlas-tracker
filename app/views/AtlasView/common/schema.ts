import { object, string } from "yup";
import { ATLAS_STATUS } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { GOOGLE_SHEETS_URL_OR_EMPTY_STRING_REGEX } from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import {
  TARGET_COMPLETION_NULL,
  TARGET_COMPLETION_REGEXP,
} from "../../../components/Form/components/Select/components/TargetCompletion/common/constants";
import { newAtlasSchema } from "../../AddNewAtlasView/common/schema";
import { FIELD_NAME } from "./constants";

export const atlasEditSchema = newAtlasSchema.concat(
  object({
    [FIELD_NAME.METADATA_CORRECTNESS_URL]: string().default("").notRequired(),
    [FIELD_NAME.METADATA_SPECIFICATION_URL]: string()
      .default("")
      .notRequired()
      .matches(
        GOOGLE_SHEETS_URL_OR_EMPTY_STRING_REGEX,
        "Metadata specification must be a Google Sheets URL"
      ),
    [FIELD_NAME.STATUS]: string()
      .default("")
      .oneOf(Object.values(ATLAS_STATUS))
      .required(),
    [FIELD_NAME.TARGET_COMPLETION]: string()
      .matches(TARGET_COMPLETION_REGEXP)
      .default(TARGET_COMPLETION_NULL),
  })
);
