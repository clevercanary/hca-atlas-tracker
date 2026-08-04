import { type InferType } from "yup";
import { type publicationStatusEditSchema } from "./schema";

export type PublicationStatusEditData = InferType<
  typeof publicationStatusEditSchema
>;
