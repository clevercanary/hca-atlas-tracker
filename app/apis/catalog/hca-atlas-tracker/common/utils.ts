import { NETWORK_KEYS } from "./constants";
import {
  HCAAtlasTrackerAPISourceDataset,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBSourceDataset,
  NetworkKey,
} from "./entities";

export function getAtlasId(atlas: HCAAtlasTrackerAtlas): string {
  return atlas.atlasId;
}

export function dbAtlasToListAtlas(
  dbAtlas: HCAAtlasTrackerDBAtlas
): HCAAtlasTrackerAtlas {
  return {
    atlasId: dbAtlas.id,
    atlasName: `${dbAtlas.overview.focus} ${dbAtlas.overview.version}`,
    atlasTitle: "",
    bioNetwork: dbAtlas.overview.network,
    codeUrl: "",
    componentAtlases: [],
    cxgCollectionId: null,
    description: null,
    focus: dbAtlas.overview.focus,
    integrationLead: "",
    integrationLeadEmail: "",
    networkCoordinator: {
      coordinatorNames: [],
      email: "",
    },
    publication: "",
    publicationUrl: "",
    sourceDatasets: [],
    status: dbAtlas.status,
    version: dbAtlas.overview.version,
  };
}

export function dbSourceDatasetToApiSourceDataset(
  dbSourceDataset: HCAAtlasTrackerDBSourceDataset
): HCAAtlasTrackerAPISourceDataset {
  const {
    sd_info: { publication },
  } = dbSourceDataset;
  return {
    doi: dbSourceDataset.doi,
    firstAuthorPrimaryName: publication?.authors[0]?.name ?? null,
    id: dbSourceDataset.id,
    journal: publication?.journal ?? null,
    publicationDate: publication?.publicationDate ?? null,
    publicationStatus: dbSourceDataset.sd_info.publicationStatus,
    title: publication?.title ?? null,
  };
}

/**
 * Returns true if the given key is a valid network key.
 * @param key - Key.
 * @returns true if the key is a valid network key.
 */
export function isNetworkKey(key: unknown): key is NetworkKey {
  return (
    typeof key === "string" && (NETWORK_KEYS as readonly string[]).includes(key)
  );
}
