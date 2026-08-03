import { type InferType } from "yup";
import { type atlasEditSchema } from "./schema";

export type AtlasEditData = InferType<typeof atlasEditSchema>;
