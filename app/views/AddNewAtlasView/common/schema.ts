import { array, object, string } from "yup";
import {
  NETWORK_KEYS,
  WAVES,
} from "../../../apis/catalog/hca-atlas-tracker/common/constants";
import { CAP_PROJECT_URL_REGEXP } from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import { CELLXGENE_COLLECTION_ID_REGEX } from "../../../common/constants";
import { isDoi } from "../../../utils/doi";
import { FIELD_NAME } from "./constants";

export const newAtlasSchema = object({
  [FIELD_NAME.INTEGRATION_LEAD]: array(
    object({
      email: string()
        .email()
        .default("")
        .required("Integration lead email is required"),
      name: string().default("").required("Integration lead name is required"),
    })
      .strict(true)
      .required(),
  )
    .min(1)
    .required(),
  [FIELD_NAME.BIO_NETWORK]: string()
    .default("")
    .required("Network is required")
    .notOneOf([""], "Network is required")
    .oneOf(NETWORK_KEYS, `Network must be one of: ${NETWORK_KEYS.join(", ")}`),
  [FIELD_NAME.CAP_ID]: string()
    .matches(CAP_PROJECT_URL_REGEXP, "Invalid CAP ID")
    .default("")
    .notRequired(),
  [FIELD_NAME.CELLXGENE_ATLAS_COLLECTION]: string()
    .default("")
    .notRequired()
    .matches(
      CELLXGENE_COLLECTION_ID_REGEX,
      "CELLxGENE collection ID must be a UUID or CELLxGENE collection URL",
    ),
  [FIELD_NAME.DOI]: string()
    .default("")
    .notRequired()
    .test(
      "is-doi",
      "DOI must be a syntactically-valid DOI",
      (value) => !value || isDoi(value),
    ),
  [FIELD_NAME.SHORT_NAME]: string()
    .default("")
    .required("Short name is required"),
  [FIELD_NAME.WAVE]: string()
    .default("")
    .required("Wave is required")
    .notOneOf([""], "Wave is required")
    .oneOf(WAVES, `Wave must be one of: ${WAVES.join(", ")}`),
}).strict(true);
