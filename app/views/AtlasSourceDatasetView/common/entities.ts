import { InferType } from "yup";
import { viewAtlasSourceDatasetSchema } from "./schema";

export type ViewAtlasSourceDatasetData = InferType<
  typeof viewAtlasSourceDatasetSchema
>;
