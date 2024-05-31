import { object, string } from "yup";
import {
  TARGET_COMPLETION_NULL,
  TARGET_COMPLETION_REGEXP,
} from "../../../components/Form/components/Select/components/TargetCompletion/common/constants";
import { newAtlasSchema } from "../../AddNewAtlasView/common/schema";
import { FIELD_NAME } from "./constants";

export const atlasEditSchema = newAtlasSchema.concat(
  object({
    [FIELD_NAME.TARGET_COMPLETION]: string()
      .matches(TARGET_COMPLETION_REGEXP)
      .default(TARGET_COMPLETION_NULL),
  })
);
