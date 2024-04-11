import { escapeRegExp } from "@clevercanary/data-explorer-ui/lib/common/utils";
import { boolean, InferType, number, object, string } from "yup";
import { MAX_WAVE, MIN_WAVE, NETWORK_KEYS } from "./constants";

const NETWORK_REGEXP = new RegExp(
  `^(?:${NETWORK_KEYS.map(escapeRegExp).join("|")})$`
);

/**
 * Schema for data used to create a new atlas.
 */
export const newAtlasSchema = object({
  network: string()
    .default("")
    .required("Network is required")
    .matches(
      NETWORK_REGEXP,
      `Network must be one of: ${NETWORK_KEYS.join(", ")}`
    ),
  shortName: string().default("").required("Short name is required"),
  version: string().default("").required("Version is required"),
  wave: number()
    .default(1)
    .required("Wave is required")
    .integer("Wave must be an integer")
    .min(MIN_WAVE, `Wave must be greater than or equal to ${MIN_WAVE}`)
    .max(MAX_WAVE, `Wave must be less than or equal to ${MAX_WAVE}`),
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
  doi: string().default("").required("DOI is required"),
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
