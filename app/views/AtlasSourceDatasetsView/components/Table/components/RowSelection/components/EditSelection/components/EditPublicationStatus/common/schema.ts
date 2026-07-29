import { PUBLICATION_STATUS } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { array, object, string } from "yup";
import { FIELD_NAME } from "./fields";

export const publicationStatusEditSchema = object({
  [FIELD_NAME.PUBLICATION_STATUS]: string()
    .default("")
    .required()
    .oneOf(Object.values(PUBLICATION_STATUS)),
  [FIELD_NAME.SOURCE_DATASET_IDS]: array(string().uuid().required())
    .default([])
    .min(1)
    .required(),
}).strict(true);
