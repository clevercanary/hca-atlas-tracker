import { type InferType } from "yup";
import { type newAtlasSchema } from "./schema";

export type NewAtlasData = InferType<typeof newAtlasSchema>;
