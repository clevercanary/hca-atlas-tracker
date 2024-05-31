import { object, string } from "yup";
import {
  NETWORK_KEYS,
  WAVES,
} from "../../../apis/catalog/hca-atlas-tracker/common/constants";
import { TARGET_COMPLETION_REGEXP } from "../../../components/Form/components/Select/components/TargetCompletion/common/constants";
import { FIELD_NAME } from "./constants";

export const newAtlasSchema = object({
  [FIELD_NAME.INTEGRATION_LEAD_A]: object({
    email: string()
      .email("Integration lead email must be an email address")
      .default("")
      .required("Integration lead email is required"),
    name: string().default("").required("Integration lead name is required"),
  }),
  [FIELD_NAME.INTEGRATION_LEAD_B]: object({
    email: string()
      .email("Integration lead email must be an email address")
      .default("")
      .when("name", {
        is: "",
        otherwise: (schema) =>
          schema.required("Integration lead email is required"),
        then: (schema) =>
          schema.oneOf([""], "Email may be specified only if name is"),
      }),
    name: string().default(""),
  }),
  [FIELD_NAME.BIO_NETWORK]: string()
    .default("")
    .required("Network is required")
    .notOneOf([""], "Network is required")
    .oneOf(NETWORK_KEYS, `Network must be one of: ${NETWORK_KEYS.join(", ")}`),
  [FIELD_NAME.SHORT_NAME]: string()
    .default("")
    .required("Short name is required"),
  [FIELD_NAME.TARGET_COMPLETION]: string()
    .matches(TARGET_COMPLETION_REGEXP, "Target completion is required")
    .default("")
    .required(),
  [FIELD_NAME.VERSION]: string().default("").required("Version is required"),
  [FIELD_NAME.WAVE]: string()
    .default("")
    .required("Wave is required")
    .notOneOf([""], "Wave is required")
    .oneOf(WAVES, `Wave must be one of: ${WAVES.join(", ")}`),
}).strict(true);
