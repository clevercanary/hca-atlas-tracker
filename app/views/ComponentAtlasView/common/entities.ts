import { InferType } from "yup";
import {
  componentAtlasDeleteSourceDatasetsSchema,
  viewIntegratedObjectSchema,
} from "./schema";

export type ComponentAtlasDeleteSourceDatasetsData = InferType<
  typeof componentAtlasDeleteSourceDatasetsSchema
>;

export type ViewIntegratedObjectData = InferType<
  typeof viewIntegratedObjectSchema
>;
