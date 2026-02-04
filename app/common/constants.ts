import { escapeRegExp } from "@databiosphere/findable-ui/lib/common/utils";
import {
  ATLAS_ECOSYSTEM_PATHS,
  ATLAS_ECOSYSTEM_URLS,
} from "../../site-config/common/constants";

export const DEFAULT_HEADERS = {
  "content-type": "application/json",
};

export const CELLXGENE_COLLECTION_ID_REGEX = new RegExp(
  `^$|^(?:${escapeRegExp(
    ATLAS_ECOSYSTEM_URLS.CELLXGENE_PORTAL +
      ATLAS_ECOSYSTEM_PATHS.CELLXGENE_COLLECTION,
  )}/)?[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}$`,
);

export const HCA_PROJECT_ID_REGEX = new RegExp(
  `^$|^(?:${escapeRegExp(
    ATLAS_ECOSYSTEM_URLS.HCA_EXPLORER + ATLAS_ECOSYSTEM_PATHS.HCA_PROJECT,
  )}/)?[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}$`,
);
