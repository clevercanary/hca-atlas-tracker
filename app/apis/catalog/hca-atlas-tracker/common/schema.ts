import { boolean, InferType, object, string } from "yup";
import { isDoi } from "../../../../utils/publications";
import { NETWORK_KEYS, WAVES } from "./constants";

/**
 * Schema for data used to create a new atlas.
 */
export const newAtlasSchema = object({
  integrationLead: object({
    email: string().default("").required("Integration lead email is requred"),
    name: string().default("").required("Integration lead name is requred"),
  })
    .required()
    .nullable(),
  network: string()
    .default("")
    .required("Network is required")
    .notOneOf([""], "Network is required")
    .oneOf(NETWORK_KEYS, `Network must be one of: ${NETWORK_KEYS.join(", ")}`),
  shortName: string().default("").required("Short name is required"),
  version: string().default("").required("Version is required"),
  wave: string()
    .default("")
    .required("Wave is required")
    .notOneOf([""], "Wave is required")
    .oneOf(WAVES, `Wave must be one of: ${WAVES.join(", ")}`),
}).strict(true);

export type NewAtlasData = InferType<typeof newAtlasSchema>;

/**
 * Schema for data used to apply edits to an atlas.
 */
export const atlasEditSchema = newAtlasSchema;

export type AtlasEditData = NewAtlasData;

/**
 * Schema for data used to create a new source dataset.
 */
export const newSourceDatasetSchema = object({
  doi: string()
    .default("")
    .required("DOI is required")
    .test("is-doi", "DOI must be a syntactically-valid DOI", (value) =>
      isDoi(value)
    ),
}).strict(true);

export type NewSourceDatasetData = InferType<typeof newSourceDatasetSchema>;

/**
 * Schema for data used to create a new user.
 */
export const newUserSchema = object({
  disabled: boolean().required(),
  email: string().required().email(),
  full_name: string().required(),
  role: string()
    .defined()
    .matches(/^(?:CONTENT_ADMIN|)$/),
}).strict(true);

export type NewUserData = InferType<typeof newUserSchema>;
