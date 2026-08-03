import { type InferType } from "yup";
import { type viewIntegratedObjectSchema } from "./schema";

export type ViewIntegratedObjectData = InferType<
  typeof viewIntegratedObjectSchema
>;
