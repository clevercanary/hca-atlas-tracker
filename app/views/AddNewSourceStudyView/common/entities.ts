import { InferType } from "yup";
import { newSourceStudySchema } from "./schema";

export type NewSourceStudyData = InferType<typeof newSourceStudySchema>;

export type NewSourceStudyDataKeys = keyof NewSourceStudyData;

export enum PUBLICATION_STATUS {
  NO_DOI = 0,
  PUBLISHED_PREPRINT = 1,
}
