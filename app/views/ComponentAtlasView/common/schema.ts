import { array, object, string } from "yup";
import { newComponentAtlasSchema } from "../../AddNewComponentAtlasView/common/schema";
import { FIELD_NAME } from "./constants";

export const componentAtlasDeleteSourceDatasetsSchema = object({
  [FIELD_NAME.SOURCE_DATASET_IDS]: array()
    .of(string().required().min(1))
    .default([]),
}).strict(true);

export const componentAtlasEditSchema = newComponentAtlasSchema;
