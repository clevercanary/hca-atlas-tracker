import { NewSourceStudyDataKeys } from "./entities";

export const FIELD_NAME = {
  CONTACT_EMAIL: "contactEmail",
  DOI: "doi",
  PUBLICATION_STATUS: "publicationStatus",
  REFERENCE_AUTHOR: "referenceAuthor",
  TITLE: "title",
} as const;

export const NO_DOI_FIELDS: NewSourceStudyDataKeys[] = [
  FIELD_NAME.CONTACT_EMAIL,
  FIELD_NAME.REFERENCE_AUTHOR,
  FIELD_NAME.TITLE,
];

export const PUBLISHED_PREPRINT_FIELDS: NewSourceStudyDataKeys[] = [
  FIELD_NAME.DOI,
];
