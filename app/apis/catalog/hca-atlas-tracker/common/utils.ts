import { GREATEST_UNIX_TIME } from "../../../../utils/date-fns";
import { NETWORK_KEYS, UNPUBLISHED, WAVES } from "./constants";
import {
  DOI_STATUS,
  DoiPublicationInfo,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerListAtlas,
  HCAAtlasTrackerListValidationRecord,
  HCAAtlasTrackerSourceStudy,
  HCAAtlasTrackerUser,
  HCAAtlasTrackerValidationRecord,
  NetworkKey,
  PublicationInfo,
  TASK_STATUS,
  VALIDATION_ID,
  Wave,
} from "./entities";

export function getAtlasId(atlas: HCAAtlasTrackerListAtlas): string {
  return atlas.id;
}

export function getTaskId(task: HCAAtlasTrackerListValidationRecord): string {
  return task.id;
}

export function getUserId(user: HCAAtlasTrackerUser): string {
  return user.id.toString();
}

export function atlasInputMapper(
  apiAtlas: HCAAtlasTrackerAtlas
): HCAAtlasTrackerListAtlas {
  return {
    bioNetwork: apiAtlas.bioNetwork,
    cellxgeneAtlasCollection: apiAtlas.cellxgeneAtlasCollection,
    cellxgeneAtlasCollectionTitle: apiAtlas.cellxgeneAtlasCollectionTitle,
    codeLinks: apiAtlas.codeLinks,
    completedTaskCount: apiAtlas.completedTaskCount,
    componentAtlasCount: apiAtlas.componentAtlasCount,
    description: apiAtlas.description,
    highlights: apiAtlas.highlights,
    id: apiAtlas.id,
    ingestionTaskCounts: apiAtlas.ingestionTaskCounts,
    integrationLeadEmail: apiAtlas.integrationLead.map(({ email }) => email),
    integrationLeadName: apiAtlas.integrationLead.map(({ name }) => name),
    metadataCorrectnessUrl: apiAtlas.metadataCorrectnessUrl,
    metadataSpecificationUrl: apiAtlas.metadataSpecificationUrl,
    name: getAtlasName(apiAtlas),
    publications: apiAtlas.publications,
    shortName: apiAtlas.shortName,
    sourceDatasetCount: apiAtlas.sourceDatasetCount,
    sourceStudyCount: apiAtlas.sourceStudyCount,
    status: apiAtlas.status,
    targetCompletion: apiAtlas.targetCompletion ?? GREATEST_UNIX_TIME,
    taskCount: apiAtlas.taskCount,
    title: apiAtlas.title,
    version: apiAtlas.version,
    wave: apiAtlas.wave,
  };
}

export function getAtlasName(atlas: HCAAtlasTrackerAtlas): string {
  return `${atlas.shortName} v${atlas.version}`;
}

/**
 * Returns the source study citation.
 * @param sourceStudy - Source study.
 * @returns Source study citation.
 */
export function getSourceStudyCitation(
  sourceStudy?: HCAAtlasTrackerSourceStudy
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
      journal
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
  validationId: VALIDATION_ID
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
    publication?.journal ?? null
  );
}

export function getPublishedCitation(
  doiStatus: DOI_STATUS,
  author: string | null,
  date: string | null,
  journal: string | null
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
  email: string | null
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
  publication: PublicationInfo | null
): string[] {
  return [
    ...(publication?.preprintOfDoi ? [publication.preprintOfDoi] : []),
    primaryDoi,
    ...(publication?.hasPreprintDoi ? [publication.hasPreprintDoi] : []),
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
 * Returns true if the given value is typed task.
 * @param value - Value.
 * @returns true if the value is a task.
 */
export function isTask(
  value: unknown
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
 * Maps the API task to the list task.
 * @param apiTask - API task.
 * @returns task.
 */
export function taskInputMapper(
  apiTask: HCAAtlasTrackerValidationRecord
): HCAAtlasTrackerListValidationRecord {
  return {
    ...apiTask,
    doi: apiTask.doi === null ? UNPUBLISHED : apiTask.doi,
    targetCompletion: apiTask.targetCompletion ?? GREATEST_UNIX_TIME,
  };
}
