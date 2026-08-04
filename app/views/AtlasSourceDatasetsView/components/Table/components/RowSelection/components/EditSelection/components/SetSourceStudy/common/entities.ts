import { type InferType } from "yup";
import { type sourceStudyEditSchema } from "./schema";

export type SourceStudyEditData = InferType<typeof sourceStudyEditSchema>;
