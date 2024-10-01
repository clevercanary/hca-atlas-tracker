import { InferType } from "yup";
import { newUserSchema } from "./schema";

export type NewUserData = InferType<typeof newUserSchema>;
