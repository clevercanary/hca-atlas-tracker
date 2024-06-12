import { object, string } from "yup";
import { FIELD_NAME } from "./constants";

export const newSourceDatasetSchema = object({
  [FIELD_NAME.TITLE]: string().default("").required("Title is required"),
}).strict(true);
