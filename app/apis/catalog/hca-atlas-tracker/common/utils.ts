import { NETWORK_KEYS, WAVES } from "./constants";
import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerListAtlas,
  HCAAtlasTrackerSourceDataset,
  NetworkKey,
  Wave,
} from "./entities";

export function getAtlasId(atlas: HCAAtlasTrackerListAtlas): string {
  return atlas.id;
}

export function atlasInputMapper(
  apiAtlas: HCAAtlasTrackerAtlas
): HCAAtlasTrackerListAtlas {
  return {
    bioNetwork: apiAtlas.bioNetwork,
    id: apiAtlas.id,
    integrationLeadEmail: apiAtlas.integrationLead?.email ?? null,
    integrationLeadName: apiAtlas.integrationLead?.name ?? null,
    name: getAtlasName(apiAtlas),
    publicationDoi: apiAtlas.publication.doi,
    publicationPubString: apiAtlas.publication.pubString,
    shortName: apiAtlas.shortName,
    status: apiAtlas.status,
    title: apiAtlas.title,
    version: apiAtlas.version,
    wave: apiAtlas.wave,
  };
}

export function dbAtlasToApiAtlas(
  dbAtlas: HCAAtlasTrackerDBAtlas
): HCAAtlasTrackerAtlas {
  return {
    bioNetwork: dbAtlas.overview.network,
    id: dbAtlas.id,
    integrationLead: dbAtlas.overview.integrationLead,
    publication: {
      doi: "",
      pubString: "",
    },
    shortName: dbAtlas.overview.shortName,
    sourceDatasetCount: dbAtlas.source_datasets.length,
    status: dbAtlas.status,
    title: "",
    version: dbAtlas.overview.version,
    wave: dbAtlas.overview.wave,
  };
}

export function dbSourceDatasetToApiSourceDataset(
  dbSourceDataset: HCAAtlasTrackerDBSourceDataset
): HCAAtlasTrackerSourceDataset {
  const {
    sd_info: { hcaProjectId, publication },
  } = dbSourceDataset;
  return {
    doi: dbSourceDataset.doi,
    firstAuthorPrimaryName: publication?.authors[0]?.name ?? null,
    hcaProjectId,
    id: dbSourceDataset.id,
    inCap: "No",
    inCellxGene: "No",
    inHcaDataRepository: hcaProjectId ? "Yes" : "No",
    journal: publication?.journal ?? null,
    publicationDate: publication?.publicationDate ?? null,
    publicationStatus: dbSourceDataset.sd_info.publicationStatus,
    title: publication?.title ?? null,
  };
}

export function getAtlasName(atlas: HCAAtlasTrackerAtlas): string {
  return `${atlas.shortName} ${atlas.version}`;
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

/**
 * Returns true if the given value is a valid wave.
 * @param value - Value.
 * @returns true if the value is a valid wave.
 */
export function isWaveValue(value: unknown): value is Wave {
  return (
    typeof value === "string" && (WAVES as readonly string[]).includes(value)
  );
}
