import { InferType } from "yup";
import { componentAtlasSourceDatasetsEditSchema } from "./schema";

export type ComponentAtlasSourceDatasetsEditData = InferType<
  typeof componentAtlasSourceDatasetsEditSchema
>;
