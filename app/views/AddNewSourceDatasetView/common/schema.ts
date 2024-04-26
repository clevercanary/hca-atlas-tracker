import { number, object, string } from "yup";
import { isDoi } from "../../../utils/doi";
import { FIELD_NAME } from "./constants";

export const newSourceDatasetSchema = object({
  [FIELD_NAME.CONTACT_EMAIL]: string()
    .default("")
    .when("isPublished", {
      is: 1,
      otherwise: (schema) =>
        schema
          .email("Email must be a valid email address")
          .required("Email is required"),
      then: (schema) => schema.notRequired(),
    }),
  [FIELD_NAME.DOI]: string()
    .default("")
    .when("isPublished", {
      is: 1,
      otherwise: (schema) => schema.notRequired(),
      then: (schema) =>
        schema
          .required("DOI is required")
          .test("is-doi", "DOI must be a syntactically-valid DOI", (value) =>
            isDoi(value)
          ),
    }),
  [FIELD_NAME.IS_PUBLISHED]: number().default(0),
  [FIELD_NAME.REFERENCE_AUTHOR]: string()
    .default("")
    .when("isPublished", {
      is: 1,
      otherwise: (schema) => schema.required("Author is required"),
      then: (schema) => schema.notRequired(),
    }),
  [FIELD_NAME.TITLE]: string()
    .default("")
    .when("isPublished", {
      is: 1,
      otherwise: (schema) => schema.required("Title is required"),
      then: (schema) => schema.notRequired(),
    }),
}).strict(true);
