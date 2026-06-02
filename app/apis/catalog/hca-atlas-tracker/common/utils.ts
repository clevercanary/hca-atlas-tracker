import { GREATEST_UNIX_TIME } from "../../../../utils/date-fns";
import {
  FILE_VALIDATOR_NAMES_HIDDEN_WHEN_REPROCESSED,
  NETWORK_KEYS,
  STATUS_LABEL,
  UNPUBLISHED,
  WAVES,
} from "./constants";
import {
  CAP_INGEST_STATUS,
  DOI_STATUS,
  DoiPublicationInfo,
  FILE_VALIDATION_STATUS,
  FileValidatorName,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerGlobalComponentAtlas,
  HCAAtlasTrackerGlobalSourceDataset,
  HCAAtlasTrackerGlobalSourceStudy,
  HCAAtlasTrackerListAtlas,
  HCAAtlasTrackerListComponentAtlas,
  HCAAtlasTrackerListSourceDataset,
  HCAAtlasTrackerListSourceStudy,
  HCAAtlasTrackerListValidationRecord,
  HCAAtlasTrackerSourceDataset,
  HCAAtlasTrackerSourceStudy,
  HCAAtlasTrackerUser,
  HCAAtlasTrackerValidationRecord,
  LinkedAtlasSummary,
  NetworkKey,
  PUBLICATION_STATUS,
  PublicationInfo,
  REPROCESSED_STATUS,
  TASK_STATUS,
  TIER_ONE_METADATA_STATUS,
  VALIDATION_ID,
  Wave,
} from "./entities";

export function getAtlasId(atlas: HCAAtlasTrackerListAtlas): string {
  return atlas.id;
}

export function getComponentAtlasId(
  componentAtlas: HCAAtlasTrackerGlobalComponentAtlas,
): string {
  return componentAtlas.id;
}

export function getSourceDatasetId(
  sourceDataset: HCAAtlasTrackerGlobalSourceDataset,
): string {
  return sourceDataset.id;
}

export function getSourceStudyId(
  sourceStudy: HCAAtlasTrackerGlobalSourceStudy,
): string {
  return sourceStudy.id;
}

export function getTaskId(task: HCAAtlasTrackerListValidationRecord): string {
  return task.id;
}

export function getUserId(user: HCAAtlasTrackerUser): string {
  return user.id.toString();
}

export function atlasInputMapper(
  apiAtlas: HCAAtlasTrackerAtlas,
): HCAAtlasTrackerListAtlas {
  return {
    bioNetwork: apiAtlas.bioNetwork,
    capId: apiAtlas.capId,
    cellxgeneAtlasCollection: apiAtlas.cellxgeneAtlasCollection,
    cellxgeneAtlasCollectionTitle: apiAtlas.cellxgeneAtlasCollectionTitle,
    codeLinks: apiAtlas.codeLinks,
    completedTaskCount: apiAtlas.completedTaskCount,
    componentAtlasCount: apiAtlas.componentAtlasCount,
    description: apiAtlas.description,
    entrySheetValidationCount: apiAtlas.entrySheetValidationCount,
    generation: apiAtlas.generation,
    highlights: apiAtlas.highlights,
    id: apiAtlas.id,
    ingestionTaskCounts: apiAtlas.ingestionTaskCounts,
    integrationLeadEmail: apiAtlas.integrationLead.map(({ email }) => email),
    integrationLeadName: apiAtlas.integrationLead.map(({ name }) => name),
    isLatest: apiAtlas.isLatest,
    metadataCorrectnessUrl: apiAtlas.metadataCorrectnessUrl,
    metadataSpecificationTitle: apiAtlas.metadataSpecificationTitle,
    metadataSpecificationUrl: apiAtlas.metadataSpecificationUrl,
    name: getAtlasName(apiAtlas),
    publications: apiAtlas.publications,
    publishedAt: apiAtlas.publishedAt,
    revision: apiAtlas.revision,
    shortName: apiAtlas.shortName,
    shortNameSlug: apiAtlas.shortNameSlug,
    sourceDatasetCount: apiAtlas.sourceDatasetCount,
    sourceStudyCount: apiAtlas.sourceStudyCount,
    status: apiAtlas.status,
    targetCompletion: apiAtlas.targetCompletion ?? GREATEST_UNIX_TIME,
    taskCount: apiAtlas.taskCount,
    title: apiAtlas.title,
    wave: apiAtlas.wave,
  };
}

export function getAtlasName(
  atlas: Pick<HCAAtlasTrackerAtlas, "shortName" | "generation" | "revision">,
): string {
  return `${atlas.shortName} v${getAtlasVersion(atlas)}`;
}

export function getAtlasVersion(
  atlas: Pick<HCAAtlasTrackerAtlas, "generation" | "revision">,
): string {
  return `${atlas.generation}.${atlas.revision}`;
}

export function getAtlasGenerationName(atlas: HCAAtlasTrackerAtlas): string {
  return `${atlas.shortName} v${atlas.generation}`;
}

/**
 * Determine CAP ingest status.
 * @param original - Original row.
 * @returns CAP ingest status.
 */
export function getCapIngestStatus(
  original: HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset,
): CAP_INGEST_STATUS {
  const { validationStatus, validationSummary } = original;

  // Determine CAP ingest status for source datasets with reprocessed status of "REPROCESSED" or "UNSPECIFIED".
  if ("reprocessedStatus" in original) {
    if (original.reprocessedStatus === REPROCESSED_STATUS.REPROCESSED) {
      // Status is "NOT_REQUIRED" for reprocessed source datasets.
      return CAP_INGEST_STATUS.NOT_REQUIRED;
    }
    if (original.reprocessedStatus === REPROCESSED_STATUS.UNSPECIFIED) {
      // Status is "INFO_REQUIRED" for unspecified source datasets.
      return CAP_INGEST_STATUS.INFO_REQUIRED;
    }
  }

  // Determine CAP ingest status with validation status of "COMPLETED".
  if (validationStatus === FILE_VALIDATION_STATUS.COMPLETED) {
    // No validation summary available.
    if (!validationSummary) {
      return CAP_INGEST_STATUS.NEEDS_VALIDATION;
    }
    // Status is "PUBLISHED" when CAP validator passes and the row has been published to CAP; otherwise "CAP_READY".
    if (validationSummary.validators.cap?.valid) {
      return original.capUrl !== null
        ? CAP_INGEST_STATUS.PUBLISHED
        : CAP_INGEST_STATUS.CAP_READY;
    }
    // Status is "CAP_VALIDATION_FAILED" with completed validation with errors.
    return CAP_INGEST_STATUS.CAP_VALIDATION_FAILED;
  }

  return CAP_INGEST_STATUS.NEEDS_VALIDATION;
}

/**
 * Combine the given Tier 1 metadata statuses into one.
 * @param statuses - Tier 1 metadata statuses.
 * @returns Tier 1 metadata status.
 */
export function getCompositeTierOneMetadataStatus(
  statuses: TIER_ONE_METADATA_STATUS[],
): TIER_ONE_METADATA_STATUS {
  let prevStatus: TIER_ONE_METADATA_STATUS | null = null;
  for (const status of statuses) {
    if (status === TIER_ONE_METADATA_STATUS.NA) continue;
    if (status === TIER_ONE_METADATA_STATUS.NEEDS_VALIDATION) return status;
    if (
      status === TIER_ONE_METADATA_STATUS.INCOMPLETE ||
      (prevStatus && prevStatus !== status)
    ) {
      return TIER_ONE_METADATA_STATUS.INCOMPLETE;
    }
    prevStatus = status;
  }
  return prevStatus ?? TIER_ONE_METADATA_STATUS.NA;
}

/**
 * Returns the source study citation.
 * @param sourceStudy - Source study.
 * @returns Source study citation.
 */
export function getSourceStudyCitation(
  sourceStudy?: HCAAtlasTrackerSourceStudy,
): string {
  if (!sourceStudy) return "";
  if (sourceStudy.doi === null) {
    const { contactEmail, referenceAuthor } = sourceStudy;
    return getUnpublishedCitation(referenceAuthor, contactEmail);
  } else {
    const { doiStatus, journal, publicationDate, referenceAuthor } =
      sourceStudy;
    return getPublishedCitation(
      doiStatus,
      referenceAuthor,
      publicationDate,
      journal,
    );
  }
}

/**
 * Get the status of a task of a source study.
 * @param sourceStudy - Source study.
 * @param validationId - Validation ID of task to get status of.
 * @returns task status, or undefined if the task doesn't exist on the given source study.
 */
export function getSourceStudyTaskStatus(
  sourceStudy: HCAAtlasTrackerSourceStudy,
  validationId: VALIDATION_ID,
): TASK_STATUS | undefined {
  return sourceStudy.tasks.find((v) => v.validationId === validationId)
    ?.taskStatus;
}

/**
 * Returns the publication citation.
 * @param doiPuplicationInfo - DOI and publication info.
 * @param doiPuplicationInfo.publication - Publication.
 * @returns publication citation.
 */
export function getPublicationCitation({
  publication,
}: DoiPublicationInfo): string {
  return getPublishedCitation(
    publication ? DOI_STATUS.OK : DOI_STATUS.DOI_NOT_ON_CROSSREF,
    publication?.authors[0].name ?? null,
    publication?.publicationDate ?? null,
    publication?.journal ?? null,
  );
}

export function getPublishedCitation(
  doiStatus: DOI_STATUS,
  author: string | null,
  date: string | null,
  journal: string | null,
): string {
  if (doiStatus !== DOI_STATUS.OK) return UNPUBLISHED;
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

export function getUnpublishedCitation(
  author: string,
  email: string | null,
): string {
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
  publication: PublicationInfo | null,
): string[] {
  return [
    ...(publication?.preprintOfDoi ? [publication.preprintOfDoi] : []),
    primaryDoi,
    ...(publication?.hasPreprintDoi ? [publication.hasPreprintDoi] : []),
  ];
}

/**
 * Get the version string for an API-model component atlas or source dataset.
 * @param entity - Component atlas or source dataset.
 * @returns version string.
 */
export function getApiEntityFileVersion(
  entity: HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset,
): string {
  return makeFileVersionString(
    entity.revision,
    entity.wipNumber,
    apiEntityIsPublished(entity),
  );
}

/**
 * Get the version string for a file based on given version numbers.
 * @param revision - Revision number from the file's metadata entity.
 * @param wipNumber - WIP number from the file's metadata entity.
 * @param isPublished - Whether the file is published.
 * @returns version string.
 */
export function makeFileVersionString(
  revision: number,
  wipNumber: number,
  isPublished: boolean,
): string {
  return isPublished ? `r${revision}` : `r${revision}-wip-${wipNumber}`;
}

/**
 * Determine whether an API-model entity is marked as published.
 * @param entity - Entity that may be published.
 * @returns boolean indicating whether the entity is published.
 */
export function apiEntityIsPublished(
  entity:
    | HCAAtlasTrackerAtlas
    | HCAAtlasTrackerComponentAtlas
    | HCAAtlasTrackerSourceDataset,
): boolean {
  return getPublishedFromPublishedAt(entity.publishedAt);
}

/**
 * Determine whether a published-at value indicates that the associated entity is published.
 * @param publishedAt - Published-at value; either a Date object, a date string, or null.
 * @returns boolean indicating whether the associated entity is published.
 */
export function getPublishedFromPublishedAt(
  publishedAt: Date | string | null,
): boolean {
  return publishedAt !== null;
}

/**
 * Get the latest revision of the home atlas from the given linked atlas summaries.
 * @param linkedAtlases - Linked atlas summaries.
 * @returns latest revision of home atlas.
 */
export function getLatestHomeAtlas(
  linkedAtlases: LinkedAtlasSummary[],
): LinkedAtlasSummary {
  const sortedHomeAtlasVersions = linkedAtlases
    .filter((atlas) => atlas.isPrimary)
    .sort((a, b) => b.revision - a.revision);
  if (sortedHomeAtlasVersions.length === 0)
    throw new Error("No home atlas found in linked atlases");
  return sortedHomeAtlasVersions[0];
}

/**
 * Convert linked atlas summaries to separate de-duplicated arrays for name, short name, version, and network.
 * @param atlases - Linked atlas summaries to get field arrays from.
 * @returns object containing arrays of unique values for atlas name, atlas short name, atlas version, and network.
 */
export function getLinkedAtlasFieldArrays(atlases: LinkedAtlasSummary[]): {
  atlasNames: string[];
  atlasShortNames: string[];
  atlasVersions: string[];
  networks: NetworkKey[];
} {
  const names = new Set<string>();
  const shortNames = new Set<string>();
  const versions = new Set<string>();
  const networks = new Set<NetworkKey>();
  for (const atlas of atlases) {
    names.add(getAtlasName(atlas));
    shortNames.add(atlas.shortName);
    versions.add(getAtlasVersion(atlas));
    networks.add(atlas.network);
  }
  return {
    atlasNames: Array.from(names),
    atlasShortNames: Array.from(shortNames),
    atlasVersions: Array.from(versions),
    networks: Array.from(networks),
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

/**
 * Returns true if the given value is typed task.
 * @param value - Value.
 * @returns true if the value is a task.
 */
export function isTask(
  value: unknown,
): value is HCAAtlasTrackerListValidationRecord {
  return (
    !!value &&
    typeof value === "object" &&
    "differences" in value &&
    "targetCompletion" in value &&
    "validationId" in value
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
 * Maps the global API component atlas to the list component atlas, augmenting
 * it with a derived `capIngestStatus` so the field is available for column
 * rendering and facet filtering.
 * @param apiComponentAtlas - API component atlas.
 * @returns list component atlas.
 */
export function componentAtlasInputMapper(
  apiComponentAtlas: HCAAtlasTrackerGlobalComponentAtlas,
): HCAAtlasTrackerListComponentAtlas {
  return {
    ...apiComponentAtlas,
    capIngestStatus: getCapIngestStatus(apiComponentAtlas),
  };
}

/**
 * Maps the global API source dataset to the list source dataset, augmenting
 * it with a derived `capIngestStatus` so the field is available for column
 * rendering and facet filtering.
 * @param apiSourceDataset - API source dataset.
 * @returns list source dataset.
 */
export function sourceDatasetInputMapper(
  apiSourceDataset: HCAAtlasTrackerGlobalSourceDataset,
): HCAAtlasTrackerListSourceDataset {
  return {
    ...apiSourceDataset,
    capIngestStatus: getCapIngestStatus(apiSourceDataset),
  };
}

/**
 * Maps the global API source study to the list source study, augmenting it
 * with a derived `hcaDataRepository` label so the field is available for
 * facet filtering. Mirrors the label-deriving logic in
 * `getSourceStudyHcaDataRepositoryLabel` (viewModelBuilders.tsx) to keep
 * utils free of the view-builder import cycle.
 * @param apiSourceStudy - API source study.
 * @returns list source study with derived fields.
 */
export function sourceStudyInputMapper(
  apiSourceStudy: HCAAtlasTrackerGlobalSourceStudy,
): HCAAtlasTrackerListSourceStudy {
  return {
    ...apiSourceStudy,
    hcaDataRepository: deriveHcaDataRepositoryLabel(apiSourceStudy),
    publicationStatus:
      apiSourceStudy.doi === null
        ? PUBLICATION_STATUS.UNPUBLISHED
        : PUBLICATION_STATUS.PUBLISHED,
    publicationString: getSourceStudyCitation(apiSourceStudy),
  };
}

/**
 * Derive the HCA Data Repository status label for a source study from its
 * underlying task statuses. Mirrors `getSourceStudyHcaDataRepositoryLabel` in
 * viewModelBuilders.tsx; kept in sync manually to avoid a circular import
 * (utils → viewModelBuilders → components pulls React client code into
 * server-side paths).
 * @param sourceStudy - Source study.
 * @returns one of the STATUS_LABEL values used for HCA data repository state.
 */
function deriveHcaDataRepositoryLabel(
  sourceStudy: HCAAtlasTrackerSourceStudy,
): string {
  const ingestStatus = getSourceStudyTaskStatus(
    sourceStudy,
    VALIDATION_ID.SOURCE_STUDY_IN_HCA_DATA_REPOSITORY,
  );
  if (ingestStatus !== TASK_STATUS.DONE) return STATUS_LABEL.TODO;
  const primaryDataStatus = getSourceStudyTaskStatus(
    sourceStudy,
    VALIDATION_ID.SOURCE_STUDY_HCA_PROJECT_HAS_PRIMARY_DATA,
  );
  if (primaryDataStatus === TASK_STATUS.DONE) return STATUS_LABEL.FASTQS;
  if (primaryDataStatus === TASK_STATUS.BLOCKED)
    return STATUS_LABEL.FASTQS_BLOCKED;
  return STATUS_LABEL.NEEDS_FASTQS;
}

/**
 * Maps the API task to the list task.
 * @param apiTask - API task.
 * @returns task.
 */
export function taskInputMapper(
  apiTask: HCAAtlasTrackerValidationRecord,
): HCAAtlasTrackerListValidationRecord {
  return {
    ...apiTask,
    doi: apiTask.doi === null ? UNPUBLISHED : apiTask.doi,
    targetCompletion: apiTask.targetCompletion ?? GREATEST_UNIX_TIME,
  };
}

/**
 * Determine whether a string matches the standard dash-separated-hexadecimal UUID format.
 * @param s - String to check.
 * @returns boolean indicating whether the string represents a UUID.
 */
export function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    s,
  );
}

/**
 * Whether a validator tab/summary entry should be rendered in the UI.
 * @param validatorName - Validator.
 * @param reprocessedStatus - Source dataset reprocessed status, when applicable; integrated objects and non-source-dataset contexts should leave it undefined.
 * @returns True when the validator should appear in UI listings.
 */
export function shouldShowValidator(
  validatorName: FileValidatorName,
  reprocessedStatus?: REPROCESSED_STATUS,
): boolean {
  if (validatorName === "cellxgene") return false;
  return !(
    reprocessedStatus === REPROCESSED_STATUS.REPROCESSED &&
    FILE_VALIDATOR_NAMES_HIDDEN_WHEN_REPROCESSED.includes(validatorName)
  );
}
