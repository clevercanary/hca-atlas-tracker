import { type InferType } from "yup";
import { type userEditSchema } from "./schema";

export type UserEditData = InferType<typeof userEditSchema>;
