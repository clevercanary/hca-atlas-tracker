import { InferType } from "yup";
import { atlasEditSchema } from "./schema";

export type AtlasEditData = InferType<typeof atlasEditSchema>;
