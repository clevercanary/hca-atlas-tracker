export const DEFAULT_INPUT_PROPS = {
  DOI: {
    isFullWidth: true,
    label: "Publication DOI No.",
    placeholder: "e.g. 10.1038/s41591-023-02327-2",
    readOnly: false,
  },
  TITLE: {
    isFullWidth: true,
    label: "Title",
    readOnly: false,
  },
};
export const FIELD_NAME = {
  CITATION: "citation",
  DOI: "doi",
  PUBLICATION_STATUS: "publicationStatus",
  TITLE: "title",
} as const;
