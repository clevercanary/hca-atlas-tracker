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
import { isDoi, normalizeDoi } from "../../../../utils/doi";
import { NETWORK_KEYS, WAVES } from "./constants";
import { ROLE } from "./entities";

/**
 * Schema for data used to create a new atlas.
 */
export const newAtlasSchema = object({
  cellxgeneAtlasCollection: string().uuid().nullable(),
  codeLinks: array().of(
    object({
      label: string(),
      url: string().url().required(),
    }).required()
  ),
  description: string().max(10000),
  dois: array()
    .of(string().required())
    .test("dois-unique", "DOIs must be unique", (value) => {
      return (
        !Array.isArray(value) ||
        new Set(value.map(normalizeDoi)).size === value.length
      );
    }),
  highlights: string().max(10000),
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
  metadataSpecificationUrl: string()
    .matches(
      /^$|^https:\/\/docs\.google\.com\/spreadsheets\//,
      "Metadata specification must be a Google Sheets URL"
    )
    .nullable(),
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
  description: string().max(10000),
  title: string().required(),
}).strict(true);

export type NewComponentAtlasData = InferType<typeof newComponentAtlasSchema>;

/**
 * Schema for data used to apply edits to a component atlas.
 */
export const componentAtlasEditSchema = newComponentAtlasSchema;

export type ComponentAtlasEditData = InferType<typeof componentAtlasEditSchema>;

/**
 * Schema for data used to add source datasets to a component atlas.
 */
export const componentAtlasAddSourceDatasetsSchema = object({
  sourceDatasetIds: array(string().required()).required(),
}).strict();

export type ComponentAtlasAddSourceDatasetsData = InferType<
  typeof componentAtlasAddSourceDatasetsSchema
>;

/**
 * Schema for data used to remove source datasets from a component atlas.
 */
export const componentAtlasDeleteSourceDatasetsSchema =
  componentAtlasAddSourceDatasetsSchema;

export type ComponentAtlasDeleteSourceDatasetsData = InferType<
  typeof componentAtlasDeleteSourceDatasetsSchema
>;

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
  capId: string().defined("CAP ID is required").nullable(),
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
  capId: string().defined("CAP ID is required").nullable(),
  cellxgeneCollectionId: string()
    .defined("CELLxGENE collection ID is required when DOI is absent")
    .nullable(),
  contactEmail: string()
    .email()
    .defined("Email is required when DOI is absent")
    .nullable(),
  hcaProjectId: string()
    .defined("HCA project ID is required when DOI is absent")
    .nullable(),
  referenceAuthor: string().required("Author is required when DOI is absent"),
  title: string().required("Title is required when DOI is absent"),
})
  .noUnknown(
    "If DOI is unspecified, only CAP ID, CELLxGENE ID, email, HCA ID, author, and title may be present"
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
 * Schema for data used to create a comment.
 */
export const newCommentSchema = object({
  text: string().required(),
}).strict();

export type NewCommentData = InferType<typeof newCommentSchema>;

/**
 * Schema for data used to edit a comment.
 */
export const commentEditSchema = newCommentSchema;

export type CommentEditData = InferType<typeof commentEditSchema>;

/**
 * Schema for data used to create a comment thread.
 */
export const newCommentThreadSchema = newCommentSchema;

export type NewCommentThreadData = InferType<typeof newCommentThreadSchema>;

/**
 * Schema for data used to set CELLxGENE ingest tasks to in-progress.
 */
export const taskCellxGeneInProgressSchema = array()
  .of(
    string()
      .required()
      .test(
        "is-doi",
        "DOIs must be syntactically-valid",
        (value) => typeof value !== "string" || isDoi(value)
      )
  )
  .strict()
  .required()
  .min(1);

export type TaskCellxGeneInProgressData = InferType<
  typeof taskCellxGeneInProgressSchema
>;

/**
 * Schema for data used to create a new user.
 */
export const newUserSchema = object({
  disabled: boolean().required(),
  email: string().required().email(),
  fullName: string().required(),
  role: string().defined().oneOf(Object.values(ROLE)),
  roleAssociatedResourceIds: array().of(string().uuid().required()).required(),
}).strict(true);

export type NewUserData = InferType<typeof newUserSchema>;

/**
 * Schema for data used to edit a user.
 */
export const userEditSchema = newUserSchema;

export type UserEditData = InferType<typeof userEditSchema>;

export const taskCompletionDatesSchema = object({
  targetCompletion: string().datetime().required().nullable(),
  taskIds: array(string().uuid().required()).required().min(1),
}).strict(true);

export type TaskCompletionDatesData = InferType<
  typeof taskCompletionDatesSchema
>;
