import { array, object, string } from "yup";
import { GOOGLE_SHEETS_URL_OR_EMPTY_STRING_REGEX } from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import {
  CELLXGENE_COLLECTION_ID_REGEX,
  HCA_PROJECT_ID_REGEX,
} from "../../../common/constants";
import { CAP_ID_REGEXP } from "../../../components/Form/components/Input/components/CapId/common/constants";
import { newSourceStudySchema } from "../../AddNewSourceStudyView/common/schema";
import { FIELD_NAME } from "./constants";

export const sourceStudyEditSchema = newSourceStudySchema.concat(
  object({
    [FIELD_NAME.CAP_ID]: string()
      .matches(CAP_ID_REGEXP, "Invalid CAP ID")
      .default("")
      .notRequired(),
    [FIELD_NAME.CELLXGENE_COLLECTION_ID]: string()
      .default("")
      .notRequired()
      .matches(
        CELLXGENE_COLLECTION_ID_REGEX,
        "CELLxGENE collection ID must be a UUID or CELLxGENE collection URL"
      ),
    [FIELD_NAME.HCA_PROJECT_ID]: string()
      .default("")
      .notRequired()
      .matches(
        HCA_PROJECT_ID_REGEX,
        "HCA project ID must be a UUID or HCA Data Explorer project URL"
      ),
    [FIELD_NAME.METADATA_SPREADSHEETS]: array(
      object({
        url: string()
          .matches(
            GOOGLE_SHEETS_URL_OR_EMPTY_STRING_REGEX,
            'Metadata spreadsheet must be a Google Sheets URL of the form "https://docs.google.com/spreadsheets/d/..."'
          )
          .required("Metadata spreadsheet URL cannot be empty"),
      }).required()
    ).required(),
  })
);
