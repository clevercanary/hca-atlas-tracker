import { object, string } from "yup";
import { isDoi } from "../../../utils/doi";

export const newSourceDatasetSchema = object({
  doi: string()
    .default("")
    .required("DOI is required")
    .test("is-doi", "DOI must be a syntactically-valid DOI", (value) =>
      isDoi(value)
    ),
}).strict(true);
