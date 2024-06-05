import { InferType } from "yup";
import { sourceStudyEditSchema } from "./schema";

export type SourceStudyEditData = InferType<typeof sourceStudyEditSchema>;

export type SourceStudyEditDataKeys = keyof SourceStudyEditData;
