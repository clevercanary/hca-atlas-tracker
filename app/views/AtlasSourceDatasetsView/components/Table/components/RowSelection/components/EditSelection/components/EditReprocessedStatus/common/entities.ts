import { InferType } from "yup";
import { reprocessedStatusEditSchema } from "./schema";

export type ReprocessedStatusEditData = InferType<
  typeof reprocessedStatusEditSchema
>;
