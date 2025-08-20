import { array, object, string } from "yup";
import { FIELD_NAME } from "./constants";

export const componentAtlasDeleteSourceDatasetsSchema = object({
  [FIELD_NAME.SOURCE_DATASET_IDS]: array()
    .of(string().required().min(1))
    .default([]),
}).strict(true);

export const componentAtlasEditSchema = object({
  [FIELD_NAME.TITLE]: string().default("").required("Title is required"),
}).strict(true);
