import { FIELD_NAME as NEW_ATLAS_FIELD_NAME } from "../../AddNewAtlasView/common/constants";

export const FIELD_NAME = {
  ...NEW_ATLAS_FIELD_NAME,
  METADATA_SPECIFICATION_URL: "metadataSpecificationUrl",
  TARGET_COMPLETION: "targetCompletion",
} as const;
