import { type InferType } from "yup";
import { type componentAtlasSourceDatasetsEditSchema } from "./schema";

export type ComponentAtlasSourceDatasetsEditData = InferType<
  typeof componentAtlasSourceDatasetsEditSchema
>;
