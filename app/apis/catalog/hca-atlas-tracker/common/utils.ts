import { NETWORK_KEYS, WAVES } from "./constants";
import {
  DOI_STATUS,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBValidationWithAtlasProperties,
  HCAAtlasTrackerListAtlas,
  HCAAtlasTrackerListValidationRecord,
  HCAAtlasTrackerSourceDataset,
  HCAAtlasTrackerValidationRecord,
  HCAAtlasTrackerValidationResult,
  NetworkKey,
  PublicationInfo,
  Wave,
} from "./entities";

export function getAtlasId(atlas: HCAAtlasTrackerListAtlas): string {
  return atlas.id;
}

export function getTaskId(task: HCAAtlasTrackerValidationResult): string {
  return `${task.entityId}${task.validationId}`;
}

export function atlasInputMapper(
  apiAtlas: HCAAtlasTrackerAtlas
): HCAAtlasTrackerListAtlas {
  return {
    bioNetwork: apiAtlas.bioNetwork,
    completedTaskCount: apiAtlas.completedTaskCount,
    id: apiAtlas.id,
    integrationLeadEmail: apiAtlas.integrationLead.map(({ email }) => email),
    integrationLeadName: apiAtlas.integrationLead.map(({ name }) => name),
    name: getAtlasName(apiAtlas),
    publicationDoi: apiAtlas.publication.doi,
    publicationPubString: apiAtlas.publication.pubString,
    shortName: apiAtlas.shortName,
    status: apiAtlas.status,
    taskCount: apiAtlas.taskCount,
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
    completedTaskCount: dbAtlas.overview.completedTaskCount,
    id: dbAtlas.id,
    integrationLead: dbAtlas.overview.integrationLead,
    publication: {
      doi: "",
      pubString: "",
    },
    shortName: dbAtlas.overview.shortName,
    sourceDatasetCount: dbAtlas.source_datasets.length,
    status: dbAtlas.status,
    taskCount: dbAtlas.overview.taskCount,
    title: "",
    version: dbAtlas.overview.version,
    wave: dbAtlas.overview.wave,
  };
}

export function dbSourceDatasetToApiSourceDataset(
  dbSourceDataset: HCAAtlasTrackerDBSourceDataset
): HCAAtlasTrackerSourceDataset {
  const {
    sd_info: { capId, cellxgeneCollectionId, hcaProjectId, publication },
  } = dbSourceDataset;
  if (dbSourceDataset.doi === null) {
    const unpublishedInfo = dbSourceDataset.sd_info.unpublishedInfo;
    return {
      capId,
      cellxgeneCollectionId,
      contactEmail: unpublishedInfo.contactEmail,
      doi: null,
      doiStatus: dbSourceDataset.sd_info.doiStatus,
      hcaProjectId,
      id: dbSourceDataset.id,
      journal: null,
      publicationDate: null,
      referenceAuthor: unpublishedInfo.referenceAuthor,
      title: unpublishedInfo.title,
    };
  } else {
    return {
      capId,
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

export function dbValidationToApiValidation(
  validation: HCAAtlasTrackerDBValidationWithAtlasProperties
): HCAAtlasTrackerValidationRecord {
  const validationInfo = validation.validation_info;
  return {
    atlasIds: validation.atlas_ids,
    atlasNames: validation.atlas_names,
    atlasShortNames: validation.atlas_short_names,
    description: validationInfo.description,
    differences: validationInfo.differences,
    doi: validationInfo.doi,
    entityId: validation.entity_id,
    entityTitle: validationInfo.entityTitle,
    entityType: validationInfo.entityType,
    id: validation.id,
    networks: validation.networks,
    publicationString: validationInfo.publicationString,
    relatedEntityUrl: validationInfo.relatedEntityUrl,
    system: validationInfo.system,
    targetCompletionDate: validation.target_completion?.toISOString() ?? null,
    taskStatus: validationInfo.taskStatus,
    validationId: validation.validation_id,
    validationStatus: validationInfo.validationStatus,
    validationType: validationInfo.validationType,
    waves: validation.waves,
  };
}

export function getAtlasName(atlas: HCAAtlasTrackerAtlas): string {
  return `${atlas.shortName} v${atlas.version}`;
}

/**
 * Returns the source dataset citation.
 * @param sourceDataset - Source dataset.
 * @returns Source dataset citation.
 */
export function getSourceDatasetCitation(
  sourceDataset?: HCAAtlasTrackerSourceDataset
): string {
  if (!sourceDataset) return "";
  if (sourceDataset.doi === null) {
    const { contactEmail, referenceAuthor } = sourceDataset;
    return getUnpublishedCitation(referenceAuthor, contactEmail);
  } else {
    const { doiStatus, journal, publicationDate, referenceAuthor } =
      sourceDataset;
    return getPublishedCitation(
      doiStatus,
      referenceAuthor,
      publicationDate,
      journal
    );
  }
}

function getPublishedCitation(
  doiStatus: DOI_STATUS,
  author: string | null,
  date: string | null,
  journal: string | null
): string {
  if (doiStatus !== DOI_STATUS.OK) return "Unpublished";
  const citation = [];
  if (author) {
    citation.push(author);
  }
  if (date) {
    const [year] = date.split("-");
    citation.push(`(${year})`);
  }
  if (journal) {
    citation.push(journal);
  }
  return citation.join(" ");
}

function getUnpublishedCitation(author: string, email: string | null): string {
  return email
    ? `${author}, ${email} - Unpublished`
    : `${author} - Unpublished`;
}

/**
 * Return DOIs associated with a given publication, ordered with journal article first.
 * @param primaryDoi - DOI for the publication itself.
 * @param publication - Publication.
 * @returns DOIs.
 */
export function getPublicationDois(
  primaryDoi: string,
  publication: PublicationInfo
): string[] {
  return [
    ...(publication.preprintOfDoi ? [publication.preprintOfDoi] : []),
    primaryDoi,
    ...(publication.hasPreprintDoi ? [publication.hasPreprintDoi] : []),
  ];
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

/**
 * Maps the API task to the list task.
 * @param apiTask - API task.
 * @returns task.
 */
export function taskInputMapper(
  apiTask: HCAAtlasTrackerValidationRecord
): HCAAtlasTrackerListValidationRecord {
  return {
    ...apiTask,
    targetCompletionDate: apiTask.targetCompletionDate ?? "Unplanned",
  };
}
