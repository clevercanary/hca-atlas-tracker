import { InferType } from "yup";
import { sourceStudiesSourceDatasetsEditSchema } from "./schema";

export type SourceStudiesSourceDatasetsEditData = InferType<
  typeof sourceStudiesSourceDatasetsEditSchema
>;
