import { mixed, object, string } from "yup";
import { isDoi } from "../../../utils/doi";
import { FIELD_NAME } from "./constants";
import { PUBLICATION_STATUS } from "./entities";

export const newSourceStudySchema = object({
  [FIELD_NAME.CONTACT_EMAIL]: string()
    .default("")
    .when(FIELD_NAME.PUBLICATION_STATUS, {
      is: PUBLICATION_STATUS.PUBLISHED,
      otherwise: (schema) =>
        schema.email("Email must be a valid email address").nullable(),
      then: (schema) => schema.notRequired(),
    }),
  [FIELD_NAME.DOI]: string()
    .default("")
    .when(FIELD_NAME.PUBLICATION_STATUS, {
      is: PUBLICATION_STATUS.PUBLISHED,
      otherwise: (schema) => schema.notRequired(),
      then: (schema) =>
        schema
          .required("DOI is required")
          .test("is-doi", "DOI must be a syntactically-valid DOI", (value) =>
            isDoi(value)
          ),
    }),
  [FIELD_NAME.PUBLICATION_STATUS]: mixed<PUBLICATION_STATUS>().default(
    PUBLICATION_STATUS.PUBLISHED
  ),
  [FIELD_NAME.REFERENCE_AUTHOR]: string()
    .default("")
    .when(FIELD_NAME.PUBLICATION_STATUS, {
      is: PUBLICATION_STATUS.PUBLISHED,
      otherwise: (schema) => schema.required("Author is required"),
      then: (schema) => schema.notRequired(),
    }),
  [FIELD_NAME.TITLE]: string()
    .default("")
    .when(FIELD_NAME.PUBLICATION_STATUS, {
      is: PUBLICATION_STATUS.PUBLISHED,
      otherwise: (schema) => schema.required("Title is required"),
      then: (schema) => schema.notRequired(),
    }),
}).strict(true);
