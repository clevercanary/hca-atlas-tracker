import { InferType } from "yup";
import { publicationStatusEditSchema } from "./schema";

export type PublicationStatusEditData = InferType<
  typeof publicationStatusEditSchema
>;
