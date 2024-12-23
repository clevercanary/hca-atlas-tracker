import { object, string } from "yup";
import { GOOGLE_SHEETS_URL_OR_EMPTY_STRING_REGEX } from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import { FIELD_NAME } from "./constants";

export const atlasSourceDatasetEditSchema = object({
  [FIELD_NAME.METADATA_SPREADSHEET_URL]: string()
    .default("")
    .notRequired()
    .matches(
      GOOGLE_SHEETS_URL_OR_EMPTY_STRING_REGEX,
      "Metadata spreadsheet must be a Google Sheets URL"
    ),
});
