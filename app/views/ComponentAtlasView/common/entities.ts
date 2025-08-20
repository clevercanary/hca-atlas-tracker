import { InferType } from "yup";
import {
  componentAtlasDeleteSourceDatasetsSchema,
  componentAtlasViewSchema,
} from "./schema";

export type ComponentAtlasDeleteSourceDatasetsData = InferType<
  typeof componentAtlasDeleteSourceDatasetsSchema
>;

export type ComponentAtlasViewData = InferType<typeof componentAtlasViewSchema>;
