import { InferType } from "yup";
import { newComponentAtlasSchema } from "./schema";

export type NewComponentAtlasData = InferType<typeof newComponentAtlasSchema>;
