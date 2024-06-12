import { InferType } from "yup";
import { newSourceDatasetSchema } from "./schema";

export type NewSourceDatasetData = InferType<typeof newSourceDatasetSchema>;
