import { escapeRegExp } from "@clevercanary/data-explorer-ui/lib/common/utils";
import { boolean, InferType, object, string } from "yup";
import { NETWORK_KEYS } from "./constants";

const NETWORK_REGEXP = new RegExp(
  `^(?:${NETWORK_KEYS.map(escapeRegExp).join("|")})$`
);

/**
 * Schema for data used to create a new atlas.
 */
export const newAtlasSchema = object({
  focus: string().required("Focus is required"),
  network: string()
    .required("Network is required")
    .matches(
      NETWORK_REGEXP,
      `Network must be one of: ${NETWORK_KEYS.join(", ")}`
    ),
  version: string().required("Version is required"),
}).strict(true);

export type NewAtlasData = InferType<typeof newAtlasSchema>;

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
