import { InferType } from "yup";
import { userEditSchema } from "./schema";

export type UserEditData = InferType<typeof userEditSchema>;
