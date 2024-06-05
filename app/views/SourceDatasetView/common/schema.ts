import { object, string } from "yup";
import { CAP_ID_REGEXP } from "../../../components/Form/components/Input/components/CapId/common/constants";
import { newSourceStudySchema } from "../../AddNewSourceDatasetView/common/schema";
import { FIELD_NAME } from "./constants";

export const sourceStudyEditSchema = newSourceStudySchema.concat(
  object({
    [FIELD_NAME.CAP_ID]: string()
      .matches(CAP_ID_REGEXP, "Invalid CAP ID")
      .default("")
      .notRequired(),
    [FIELD_NAME.CELLXGENE_COLLECTION_ID]: string().default("").notRequired(),
    [FIELD_NAME.HCA_PROJECT_ID]: string().default("").notRequired(),
  })
);
