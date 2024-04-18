export const DEFAULT_INPUT_PROPS = {
  CELLXGENE_COLLECTION_ID: {
    isFullWidth: true,
    label: "CELLxGENE collection ID",
    readOnly: false,
  },
  DOI: {
    isFullWidth: true,
    label: "Publication DOI no.",
    placeholder: "e.g. 10.1038/s41591-023-02327-2",
    readOnly: false,
  },
  HCA_PROJECT_ID: {
    isFullWidth: true,
    label: "HCA repository project ID",
    readOnly: false,
  },
  TITLE: {
    isFullWidth: true,
    label: "Title",
    readOnly: false,
  },
};
export const FIELD_NAME = {
  CELLXGENE_COLLECTION_ID: "cellxgeneCollectionId",
  DOI: "doi",
  HCA_PROJECT_ID: "hcaProjectId",
  TITLE: "title",
} as const;
