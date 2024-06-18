import { InferType } from "yup";
import {
  componentAtlasDeleteSourceDatasetsSchema,
  componentAtlasEditSchema,
} from "./schema";

export type ComponentAtlasDeleteSourceDatasetsData = InferType<
  typeof componentAtlasDeleteSourceDatasetsSchema
>;

export type ComponentAtlasEditData = InferType<typeof componentAtlasEditSchema>;
