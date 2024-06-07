import { InferType } from "yup";
import { componentAtlasEditSchema } from "./schema";

export type ComponentAtlasEditData = InferType<typeof componentAtlasEditSchema>;
