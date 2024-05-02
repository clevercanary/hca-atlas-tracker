import { InferType } from "yup";
import { newSourceDatasetSchema } from "./schema";

export type NewSourceDatasetData = InferType<typeof newSourceDatasetSchema>;

export type NewSourceDatasetDataKeys = keyof NewSourceDatasetData;

export enum PUBLICATION_STATUS {
  PUBLISHED = 1,
  UNPUBLISHED = 0,
}
