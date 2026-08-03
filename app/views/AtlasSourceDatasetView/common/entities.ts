import { type InferType } from "yup";
import { type viewAtlasSourceDatasetSchema } from "./schema";

export type ViewAtlasSourceDatasetData = InferType<
  typeof viewAtlasSourceDatasetSchema
>;
