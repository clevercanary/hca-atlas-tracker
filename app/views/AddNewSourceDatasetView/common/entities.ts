import { InferType } from "yup";
import { newSourceDatasetSchema } from "./schema";

export type NewSourceDatasetData = InferType<typeof newSourceDatasetSchema>;

export enum PUBLICATION_STATUS {
  PUBLISHED = 1,
  UNPUBLISHED = 0,
}
