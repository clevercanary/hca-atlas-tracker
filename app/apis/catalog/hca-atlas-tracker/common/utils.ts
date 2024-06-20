import { GREATEST_UNIX_TIME } from "../../../../utils/date-fns";
import { NETWORK_KEYS, WAVES } from "./constants";
import {
  DOI_STATUS,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerDBAtlasWithComponentAtlases,
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBSourceDatasetWithStudyProperties,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerDBValidationWithAtlasProperties,
  HCAAtlasTrackerListAtlas,
  HCAAtlasTrackerListValidationRecord,
  HCAAtlasTrackerSourceDataset,
  HCAAtlasTrackerSourceStudy,
  HCAAtlasTrackerValidationRecord,
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

export function atlasInputMapper(
  apiAtlas: HCAAtlasTrackerAtlas
): HCAAtlasTrackerListAtlas {
  return {
    bioNetwork: apiAtlas.bioNetwork,
    completedTaskCount: apiAtlas.completedTaskCount,
    componentAtlasCount: apiAtlas.componentAtlasCount,
    id: apiAtlas.id,
    integrationLeadEmail: apiAtlas.integrationLead.map(({ email }) => email),
    integrationLeadName: apiAtlas.integrationLead.map(({ name }) => name),
    name: getAtlasName(apiAtlas),
    publicationDoi: apiAtlas.publication.doi,
    publicationPubString: apiAtlas.publication.pubString,
    shortName: apiAtlas.shortName,
    sourceStudyCount: apiAtlas.sourceStudyCount,
    status: apiAtlas.status,
    targetCompletion: apiAtlas.targetCompletion ?? GREATEST_UNIX_TIME,
    taskCount: apiAtlas.taskCount,
    title: apiAtlas.title,
    version: apiAtlas.version,
    wave: apiAtlas.wave,
  };
}

export function dbAtlasToApiAtlas(
  dbAtlas: HCAAtlasTrackerDBAtlasWithComponentAtlases
): HCAAtlasTrackerAtlas {
  return {
    bioNetwork: dbAtlas.overview.network,
    completedTaskCount: dbAtlas.overview.completedTaskCount,
    componentAtlasCount: dbAtlas.component_atlas_count,
    id: dbAtlas.id,
    integrationLead: dbAtlas.overview.integrationLead,
    publication: {
      doi: "",
      pubString: "",
    },
    shortName: dbAtlas.overview.shortName,
    sourceStudyCount: dbAtlas.source_studies.length,
    status: dbAtlas.status,
    targetCompletion: dbAtlas.target_completion?.toISOString() ?? null,
    taskCount: dbAtlas.overview.taskCount,
    title: "",
    version: dbAtlas.overview.version,
    wave: dbAtlas.overview.wave,
  };
}

export function dbComponentAtlasToApiComponentAtlas(
  dbComponentAtlas: HCAAtlasTrackerDBComponentAtlas
): HCAAtlasTrackerComponentAtlas {
  return {
    atlasId: dbComponentAtlas.atlas_id,
    cellxgeneDatasetId: dbComponentAtlas.component_info.cellxgeneDatasetId,
    cellxgeneDatasetVersion:
      dbComponentAtlas.component_info.cellxgeneDatasetVersion,
    id: dbComponentAtlas.id,
    title: dbComponentAtlas.title,
  };
}

export function dbSourceStudyToApiSourceStudy(
  dbSourceStudy: HCAAtlasTrackerDBSourceStudy
): HCAAtlasTrackerSourceStudy {
  const {
    study_info: { capId, cellxgeneCollectionId, hcaProjectId, publication },
  } = dbSourceStudy;
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
    publicationString: getDbSourceDatasetCitation(dbSourceDataset),
    sourceStudyId: dbSourceDataset.source_study_id,
    sourceStudyTitle:
      studyInfo.publication?.title ?? studyInfo.unpublishedInfo?.title ?? null,
    tissue: dbSourceDataset.sd_info.tissue,
    title: dbSourceDataset.sd_info.title,
    updatedAt: dbSourceDataset.updated_at.toISOString(),
  };
}

export function dbValidationToApiValidation(
  validation: HCAAtlasTrackerDBValidationWithAtlasProperties
): HCAAtlasTrackerValidationRecord {
  const validationInfo = validation.validation_info;
  return {
    atlasIds: validation.atlas_ids,
    atlasNames: validation.atlas_names,
    atlasShortNames: validation.atlas_short_names,
    createdAt: validation.created_at.toISOString(),
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
    resolvedAt: validation.resolved_at?.toISOString() ?? null,
    system: validationInfo.system,
    targetCompletion: validation.target_completion?.toISOString() ?? null,
    taskStatus: validationInfo.taskStatus,
    updatedAt: validation.updated_at.toISOString(),
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
 * @param sourceDataset - Database model of source dataset with source study properties.
 * @returns Source dataset citation.
 */
function getDbSourceDatasetCitation(
  sourceDataset: HCAAtlasTrackerDBSourceDatasetWithStudyProperties
): string {
  if (sourceDataset.doi === null) {
    const { contactEmail, referenceAuthor } =
      sourceDataset.study_info.unpublishedInfo;
    return getUnpublishedCitation(referenceAuthor, contactEmail);
  } else {
    const studyInfo = sourceDataset.study_info;
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
    doi: apiTask.doi === null ? "Unpublished" : apiTask.doi,
    targetCompletion: apiTask.targetCompletion ?? GREATEST_UNIX_TIME,
  };
}
