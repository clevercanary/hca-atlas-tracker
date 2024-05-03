import { InferType } from "yup";
import { newAtlasSchema } from "./schema";

export type NewAtlasData = InferType<typeof newAtlasSchema>;
