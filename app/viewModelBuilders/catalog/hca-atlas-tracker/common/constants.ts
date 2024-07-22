import { METADATA_KEY as M } from "./entities";

export const EXTRA_PROPS = {
  BIO_NETWORK_CELL: {
    TypographyProps: { alignSelf: "center" },
  },
};

/**
 * Value for displaying pluralized metadata labels, for example, "tissues" or "diseases".
 */
export const PLURALIZED_METADATA_LABEL = {
  [M.ANATOMICAL_ENTITY]: "anatomical entities",
  [M.ASSAY]: "assays",
  [M.ATLAS_VERSION]: "atlas versions",
  [M.DISEASE]: "diseases",
  [M.LIBRARY_CONSTRUCTION_METHOD]: "library construction methods",
  [M.SPECIES]: "species",
  [M.SUSPENSION_TYPE]: "suspension types",
  [M.TISSUE]: "tissues",
};
