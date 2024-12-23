import { InferType } from "yup";
import { atlasSourceDatasetEditSchema } from "./schema";

export type AtlasSourceDatasetEditData = InferType<
  typeof atlasSourceDatasetEditSchema
>;
