import { array, object, string } from "yup";
import { ROLE } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FIELD_NAME } from "./constants";

export const newUserSchema = object({
  [FIELD_NAME.DISABLED]: string().oneOf(["enabled", "disabled"]).required(),
  [FIELD_NAME.EMAIL]: string().required().email(),
  [FIELD_NAME.FULL_NAME]: string().required(),
  [FIELD_NAME.ROLE]: string().defined().oneOf(Object.values(ROLE)),
  [FIELD_NAME.ROLE_ASSOCIATED_RESOURCE_IDS]: array()
    .of(string().uuid().required())
    .required(),
}).strict(true);
