import { InferType } from "yup";
import { viewIntegratedObjectSchema } from "./schema";

export type ViewIntegratedObjectData = InferType<
  typeof viewIntegratedObjectSchema
>;
