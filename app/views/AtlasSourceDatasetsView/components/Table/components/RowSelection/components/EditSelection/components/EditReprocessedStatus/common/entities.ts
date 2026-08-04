import { type InferType } from "yup";
import { type reprocessedStatusEditSchema } from "./schema";

export type ReprocessedStatusEditData = InferType<
  typeof reprocessedStatusEditSchema
>;
