import { GREATEST_UNIX_TIME } from "../../../../utils/date-fns";
import { NETWORK_KEYS, UNPUBLISHED, WAVES } from "./constants";
import {
  DOI_STATUS,
  DoiPublicationInfo,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerComment,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerDBComment,
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBSourceDatasetWithStudyProperties,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerDBSourceStudyWithRelatedEntities,
  HCAAtlasTrackerDBUserWithAssociatedResources,
  HCAAtlasTrackerDBValidation,
  HCAAtlasTrackerDBValidationWithAtlasProperties,
  HCAAtlasTrackerListAtlas,
  HCAAtlasTrackerListValidationRecord,
  HCAAtlasTrackerSourceDataset,
  HCAAtlasTrackerSourceStudy,
  HCAAtlasTrackerUser,
  HCAAtlasTrackerValidationRecord,
  HCAAtlasTrackerValidationRecordWithoutAtlases,
  NetworkKey,
  PublicationInfo,
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
    integrationLeadEmail: apiAtlas.integrationLead.map(({ email }) => email),
    integrationLeadName: apiAtlas.integrationLead.map(({ name }) => name),
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

export function dbComponentAtlasToApiComponentAtlas(
  dbComponentAtlas: HCAAtlasTrackerDBComponentAtlas
): HCAAtlasTrackerComponentAtlas {
  return {
    assay: dbComponentAtlas.component_info.assay,
    atlasId: dbComponentAtlas.atlas_id,
    cellCount: dbComponentAtlas.component_info.cellCount,
    cellxgeneDatasetId: dbComponentAtlas.component_info.cellxgeneDatasetId,
    cellxgeneDatasetVersion:
      dbComponentAtlas.component_info.cellxgeneDatasetVersion,
    description: dbComponentAtlas.component_info.description,
    disease: dbComponentAtlas.component_info.disease,
    id: dbComponentAtlas.id,
    sourceDatasetCount: dbComponentAtlas.source_datasets.length,
    suspensionType: dbComponentAtlas.component_info.suspensionType,
    tissue: dbComponentAtlas.component_info.tissue,
    title: dbComponentAtlas.title,
  };
}

export function dbSourceStudyToApiSourceStudy(
  dbSourceStudy: HCAAtlasTrackerDBSourceStudyWithRelatedEntities
): HCAAtlasTrackerSourceStudy {
  const {
    study_info: { capId, cellxgeneCollectionId, hcaProjectId, publication },
  } = dbSourceStudy;
  const tasks = dbSourceStudy.validations.map(
    dbValidationToApiValidationWithoutAtlasProperties
  );
  if (dbSourceStudy.doi === null) {
    const unpublishedInfo = dbSourceStudy.study_info.unpublishedInfo;
    return {
      capId,
      cellxgeneCollectionId,
      contactEmail: unpublishedInfo.contactEmail,
      doi: null,
      doiStatus: dbSourceStudy.study_info.doiStatus,
      hcaProjectId,
      id: dbSourceStudy.id,
      journal: null,
      publicationDate: null,
      referenceAuthor: unpublishedInfo.referenceAuthor,
      sourceDatasetCount: dbSourceStudy.source_dataset_count,
      tasks,
      title: unpublishedInfo.title,
    };
  } else {
    return {
      capId,
      cellxgeneCollectionId,
      contactEmail: null,
      doi: dbSourceStudy.doi,
      doiStatus: dbSourceStudy.study_info.doiStatus,
      hcaProjectId,
      id: dbSourceStudy.id,
      journal: publication?.journal ?? null,
      publicationDate: publication?.publicationDate ?? null,
      referenceAuthor: publication?.authors[0]?.name ?? null,
      sourceDatasetCount: dbSourceStudy.source_dataset_count,
      tasks,
      title: publication?.title ?? null,
    };
  }
}

export function dbSourceDatasetToApiSourceDataset(
  dbSourceDataset: HCAAtlasTrackerDBSourceDatasetWithStudyProperties
): HCAAtlasTrackerSourceDataset {
  const studyInfo = dbSourceDataset.study_info;
  return {
    assay: dbSourceDataset.sd_info.assay,
    cellCount: dbSourceDataset.sd_info.cellCount,
    cellxgeneDatasetId: dbSourceDataset.sd_info.cellxgeneDatasetId,
    cellxgeneDatasetVersion: dbSourceDataset.sd_info.cellxgeneDatasetVersion,
    cellxgeneExplorerUrl: dbSourceDataset.sd_info.cellxgeneExplorerUrl,
    createdAt: dbSourceDataset.created_at.toISOString(),
    disease: dbSourceDataset.sd_info.disease,
    doi: dbSourceDataset.doi,
    id: dbSourceDataset.id,
    metadataSpreadsheetUrl: dbSourceDataset.sd_info.metadataSpreadsheetUrl,
    publicationString: getDbEntityCitation(dbSourceDataset),
    sourceStudyId: dbSourceDataset.source_study_id,
    sourceStudyTitle:
      studyInfo.publication?.title ?? studyInfo.unpublishedInfo?.title ?? null,
    suspensionType: dbSourceDataset.sd_info.suspensionType,
    tissue: dbSourceDataset.sd_info.tissue,
    title: dbSourceDataset.sd_info.title,
    updatedAt: dbSourceDataset.updated_at.toISOString(),
  };
}

export function dbValidationToApiValidation(
  validation: HCAAtlasTrackerDBValidationWithAtlasProperties
): HCAAtlasTrackerValidationRecord {
  return {
    ...dbValidationToApiValidationWithoutAtlasProperties(validation),
    atlasIds: validation.atlas_ids,
    atlasNames: validation.atlas_names,
    atlasShortNames: validation.atlas_short_names,
    atlasVersions: validation.atlas_versions,
    networks: validation.networks,
    waves: validation.waves,
  };
}

function dbValidationToApiValidationWithoutAtlasProperties(
  validation: HCAAtlasTrackerDBValidation
): HCAAtlasTrackerValidationRecordWithoutAtlases {
  const validationInfo = validation.validation_info;
  return {
    commentThreadId: validation.comment_thread_id,
    createdAt: validation.created_at.toISOString(),
    description: validationInfo.description,
    differences: validationInfo.differences,
    doi: validationInfo.doi,
    entityId: validation.entity_id,
    entityTitle: validationInfo.entityTitle,
    entityType: validationInfo.entityType,
    id: validation.id,
    publicationString: validationInfo.publicationString,
    relatedEntityUrl: validationInfo.relatedEntityUrl,
    resolvedAt: validation.resolved_at?.toISOString() ?? null,
    system: validationInfo.system,
    targetCompletion: validation.target_completion?.toISOString() ?? null,
    taskStatus: validationInfo.taskStatus,
    updatedAt: validation.updated_at.toISOString(),
    validationId: validation.validation_id,
    validationStatus: validationInfo.validationStatus,
    validationType: validationInfo.validationType,
  };
}

export function dbCommentToApiComment(
  dbComment: HCAAtlasTrackerDBComment
): HCAAtlasTrackerComment {
  return {
    createdAt: dbComment.created_at.toISOString(),
    createdBy: dbComment.created_by,
    id: dbComment.id,
    text: dbComment.text,
    threadId: dbComment.thread_id,
    updatedAt: dbComment.updated_at.toISOString(),
    updatedBy: dbComment.updated_by,
  };
}

export function dbUserToApiUser(
  dbUser: HCAAtlasTrackerDBUserWithAssociatedResources
): HCAAtlasTrackerUser {
  return {
    disabled: dbUser.disabled,
    email: dbUser.email,
    fullName: dbUser.full_name,
    id: dbUser.id,
    lastLogin: dbUser.last_login.toISOString(),
    role: dbUser.role,
    roleAssociatedResourceIds: dbUser.role_associated_resource_ids,
    roleAssociatedResourceNames: dbUser.role_associated_resource_names,
  };
}

export function getAtlasName(atlas: HCAAtlasTrackerAtlas): string {
  return `${atlas.shortName} v${atlas.version}`;
}

/**
 * Returns the entity's citation.
 * @param entity - Database model of entity with source study properties.
 * @returns citation for the associated source study.
 */
export function getDbEntityCitation(
  entity:
    | HCAAtlasTrackerDBSourceStudy
    | HCAAtlasTrackerDBSourceDatasetWithStudyProperties
): string {
  if (entity.doi === null) {
    const { contactEmail, referenceAuthor } = entity.study_info.unpublishedInfo;
    return getUnpublishedCitation(referenceAuthor, contactEmail);
  } else {
    const studyInfo = entity.study_info;
    const publication = studyInfo.publication;
    return getPublishedCitation(
      studyInfo.doiStatus,
      publication?.authors[0].name ?? null,
      publication?.publicationDate ?? null,
      publication?.journal ?? null
    );
  }
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

function getPublishedCitation(
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
