export enum COMPONENT_NAME {
  BASIC_CELL = "BasicCell",
  BIO_NETWORK_CELL = "BioNetworkCell",
  LINK = "Link",
  N_TAG_CELL = "NTagCell",
}

export type ExtraProps = Record<string, unknown>;

/**
 * Set of possible metadata keys.
 */
export enum METADATA_KEY {
  ANATOMICAL_ENTITY = "ANATOMICAL_ENTITY",
  ASSAY = "ASSAY",
  ATLAS_VERSION = "ATLAS_VERSION",
  DISEASE = "DISEASE",
  LIBRARY_CONSTRUCTION_METHOD = "LIBRARY_CONSTRUCTION_METHOD",
  SPECIES = "SPECIES",
  SUSPENSION_TYPE = "SUSPENSION_TYPE",
  TISSUE = "TISSUE",
}

/**
 * Possible set of diseases.
 */
export enum DISEASE {
  NORMAL = "normal",
}

export type ExtraPropsByComponentName = Map<COMPONENT_NAME, ExtraProps>;

export type Unused = unknown;
