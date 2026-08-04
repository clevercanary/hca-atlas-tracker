import { type InferType } from "yup";
import { type newUserSchema } from "./schema";

export type NewUserData = InferType<typeof newUserSchema>;
