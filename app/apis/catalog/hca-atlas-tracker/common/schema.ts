import { boolean, InferType, object, string } from "yup";

/**
 * Schema for data used to create a new user.
 */
export const newUserSchema = object({
  disabled: boolean().required().strict(true),
  email: string().required().email().strict(true),
  full_name: string().required().strict(true),
  role: string()
    .defined()
    .matches(/^(?:CONTENT_ADMIN|)$/)
    .strict(true),
});

export type NewUserData = InferType<typeof newUserSchema>;
