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
    sd_info: {
      cellxgeneCollectionId,
      hcaProjectId,
      publication,
      unpublishedInfo,
    },
  } = dbSourceDataset;
  if (dbSourceDataset.doi === null) {
    return {
      capId: null,
      cellxgeneCollectionId,
      contactEmail: unpublishedInfo?.contactEmail ?? "",
      doi: null,
      doiStatus: dbSourceDataset.sd_info.doiStatus,
      hcaProjectId,
      id: dbSourceDataset.id,
      journal: null,
      publicationDate: null,
      referenceAuthor: unpublishedInfo?.referenceAuthor ?? "",
      title: unpublishedInfo?.title ?? "",
    };
  } else {
    return {
      capId: null,
      cellxgeneCollectionId,
      contactEmail: null,
      doi: dbSourceDataset.doi,
      doiStatus: dbSourceDataset.sd_info.doiStatus,
      hcaProjectId,
      id: dbSourceDataset.id,
      journal: publication?.journal ?? null,
      publicationDate: publication?.publicationDate ?? null,
      referenceAuthor: publication?.authors[0]?.name ?? null,
      title: publication?.title ?? null,
    };
  }
}

export function getAtlasName(atlas: HCAAtlasTrackerAtlas): string {
  return `${atlas.shortName} v${atlas.version}`;
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
