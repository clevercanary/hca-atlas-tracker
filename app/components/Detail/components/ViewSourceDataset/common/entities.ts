import { InferType } from "yup";
import { sourceDatasetEditSchema } from "./schema";

export type SourceDatasetEditData = InferType<typeof sourceDatasetEditSchema>;
