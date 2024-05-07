import { object, string } from "yup";
import { newSourceDatasetSchema } from "../../AddNewSourceDatasetView/common/schema";
import { FIELD_NAME } from "./constants";

export const sourceDatasetEditSchema = newSourceDatasetSchema.concat(
  object({
    [FIELD_NAME.CELLXGENE_COLLECTION_ID]: string().default("").notRequired(),
    [FIELD_NAME.HCA_PROJECT_ID]: string().default("").notRequired(),
  })
);
