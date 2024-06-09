import {
  array,
  boolean,
  InferType,
  mixed,
  MixedSchema,
  object,
  Schema,
  string,
} from "yup";
import { isDoi } from "../../../../utils/doi";
import { NETWORK_KEYS, WAVES } from "./constants";

/**
 * Schema for data used to create a new atlas.
 */
export const newAtlasSchema = object({
  integrationLead: array()
    .of(
      object({
        email: string()
          .email("Integration lead email must be an email address")
          .default("")
          .required("Integration lead email is required"),
        name: string()
          .default("")
          .required("Integration lead name is required"),
      }).required()
    )
    .required(),
  network: string()
    .default("")
    .required("Network is required")
    .notOneOf([""], "Network is required")
    .oneOf(NETWORK_KEYS, `Network must be one of: ${NETWORK_KEYS.join(", ")}`),
  shortName: string().default("").required("Short name is required"),
  targetCompletion: string().datetime().nullable(),
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

export type AtlasEditData = InferType<typeof atlasEditSchema>;

/**
 * Schema for data used to create a new component atlas.
 */
export const newComponentAtlasSchema = object({
  title: string().required(),
}).strict(true);

export type NewComponentAtlasData = InferType<typeof newComponentAtlasSchema>;

/**
 * Schema for data used to apply edits to a component atlas.
 */
export const componentAtlasEditSchema = newComponentAtlasSchema;

export type ComponentAtlasEditData = InferType<typeof componentAtlasEditSchema>;

/**
 * Create schema that combines an unpublished source study schema and a published source study schema.
 * @param publishedSchema - Published source study schema.
 * @param unpublishedSchema - Unpublished source study schema.
 * @returns schema that validates both published and unpublished source studies.
 */
function makeSourceStudyUnionSchema<T extends { [k: string]: unknown }>(
  publishedSchema: Schema,
  unpublishedSchema: Schema
): MixedSchema<T> {
  return (
    mixed<T>()
      .required()
      // `transform` is used to allow empty string contactEmail to be converted to null
      .transform((value) => {
        if (
          value &&
          typeof value === "object" &&
          "doi" in value &&
          value.doi !== undefined
        ) {
          // If DOI is present, use published schema, setting CAP ID to null if it's empty string
          if (
            value &&
            typeof value === "object" &&
            "capId" in value &&
            value.capId === ""
          ) {
            value = {
              ...value,
              capId: null,
            };
          }
          return publishedSchema.validateSync(value);
        } else {
          // Otherwise, use unpublished schema, setting contactEmail to null if it's empty string
          if (
            value &&
            typeof value === "object" &&
            "contactEmail" in value &&
            value.contactEmail === ""
          ) {
            value = {
              ...value,
              contactEmail: null,
            };
          }
          return unpublishedSchema.validateSync(value);
        }
      })
  );
}

/**
 * Schemas for data used to create a new source study.
 */

export const newPublishedSourceStudySchema = object({
  doi: string()
    .required()
    .test(
      "is-doi",
      "DOI must be a syntactically-valid DOI",
      (value) => typeof value !== "string" || isDoi(value)
    ),
})
  .noUnknown("If DOI is specified, it must be the only field")
  .strict(true);

export const newUnpublishedSourceStudySchema = object({
  contactEmail: string()
    .email()
    .defined("Email is required when DOI is absent")
    .nullable(),
  referenceAuthor: string().required("Author is required when DOI is absent"),
  title: string().required("Title is required when DOI is absent"),
})
  .noUnknown(
    "If DOI is unspecified, only email, author, and name may be present"
  )
  .strict(true);

// Combined schema for validating both published and unpublished data
export const newSourceStudySchema =
  makeSourceStudyUnionSchema<NewSourceStudyData>(
    newPublishedSourceStudySchema,
    newUnpublishedSourceStudySchema
  );

export type NewPublishedSourceStudyData = InferType<
  typeof newPublishedSourceStudySchema
>;

export type NewUnpublishedSourceStudyData = InferType<
  typeof newUnpublishedSourceStudySchema
>;

export type NewSourceStudyData =
  | NewPublishedSourceStudyData
  | NewUnpublishedSourceStudyData;

/**
 * Schemas for data used to edit a source stufy.
 */

export const publishedSourceStudyEditSchema = object({
  capId: string().defined("CAP ID is required when DOI is present").nullable(),
  doi: string()
    .required()
    .test(
      "is-doi",
      "DOI must be a syntactically-valid DOI",
      (value) => typeof value !== "string" || isDoi(value)
    ),
})
  .noUnknown(
    "If DOI is specified, it must appear alongside CAP ID and no other fields"
  )
  .strict(true);

export const unpublishedSourceStudyEditSchema = object({
  contactEmail: string()
    .email()
    .defined("Email is required when DOI is absent")
    .nullable(),
  referenceAuthor: string().required("Author is required when DOI is absent"),
  title: string().required("Title is required when DOI is absent"),
})
  .noUnknown(
    "If DOI is unspecified, only email, author, and name may be present"
  )
  .strict(true);

// Combined schema for validating both published and unpublished data
export const sourceStudyEditSchema =
  makeSourceStudyUnionSchema<SourceStudyEditData>(
    publishedSourceStudyEditSchema,
    unpublishedSourceStudyEditSchema
  );

export type PublishedSourceStudyEditData = InferType<
  typeof publishedSourceStudyEditSchema
>;

export type UnpublishedSourceStudyEditData = InferType<
  typeof unpublishedSourceStudyEditSchema
>;

export type SourceStudyEditData =
  | PublishedSourceStudyEditData
  | UnpublishedSourceStudyEditData;

/**
 * Schema for data used to create a new source dataset.
 */
export const newSourceDatasetSchema = object({
  title: string().required(),
}).strict();

export type NewSourceDatasetData = InferType<typeof newSourceDatasetSchema>;

export const sourceDatasetEditSchema = object({
  title: string().required(),
}).strict();

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

export const taskCompletionDatesSchema = object({
  targetCompletion: string().datetime().required().nullable(),
  taskIds: array(string().uuid().required()).required().min(1),
}).strict(true);

export type TaskCompletionDatesData = InferType<
  typeof taskCompletionDatesSchema
>;
