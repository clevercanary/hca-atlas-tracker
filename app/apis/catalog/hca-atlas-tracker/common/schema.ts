import { boolean, InferType, mixed, object, string } from "yup";
import { isDoi } from "../../../../utils/doi";
import { NETWORK_KEYS, WAVES } from "./constants";

/**
 * Schema for data used to create a new atlas.
 */
export const newAtlasSchema = object({
  integrationLead: object({
    email: string()
      .email("Integration lead email must be an email address")
      .default("")
      .required("Integration lead email is required"),
    name: string().default("").required("Integration lead name is required"),
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
  author: string()
    .default("")
    .when("doi", {
      is: undefined,
      otherwise: () =>
        mixed().oneOf(
          [undefined],
          "Author must be omitted when DOI is present"
        ),
      then: (schema) =>
        schema.required("Author is required when DOI is absent"),
    }),
  contactEmail: string()
    .email()
    .default("")
    .when("doi", {
      is: undefined,
      otherwise: () =>
        mixed().oneOf([undefined], "Email must be omitted when DOI is present"),
      then: (schema) => schema.required("Email is required when DOI is absent"),
    }),
  doi: string()
    .default("")
    .test(
      "is-doi",
      "DOI must be a syntactically-valid DOI",
      (value) => typeof value !== "string" || isDoi(value)
    ),
  title: string()
    .default("")
    .when("doi", {
      is: undefined,
      otherwise: () =>
        mixed().oneOf([undefined], "Title must be omitted when DOI is present"),
      then: (schema) => schema.required("Title is required when DOI is absent"),
    }),
}).strict(true);

export type NewSourceDatasetData = InferType<typeof newSourceDatasetSchema>;

/**
 * Schema for data used to apply edits to a source dataset.
 */
export const sourceDatasetEditSchema = newSourceDatasetSchema.concat(
  object({
    cellxgeneCollectionId: string().default("").notRequired(),
    hcaProjectId: string().default("").notRequired(),
    title: string().default("").required("Title is required"),
  })
);

export type SourceDatasetEditData = InferType<typeof sourceDatasetEditSchema>;

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
