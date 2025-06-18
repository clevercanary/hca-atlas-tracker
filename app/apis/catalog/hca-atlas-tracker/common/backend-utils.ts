import savedCellxgeneInfo from "../../../../../catalog/output/cellxgene-info.json";
import { getCellxGeneCollectionInfoById } from "../../../../services/cellxgene";
import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerComment,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerDBAtlasWithComponentAtlases,
  HCAAtlasTrackerDBComment,
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBEntrySheetValidation,
  HCAAtlasTrackerDBEntrySheetValidationListFields,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceDatasetWithStudyProperties,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerDBSourceStudyWithRelatedEntities,
  HCAAtlasTrackerDBUserWithAssociatedResources,
  HCAAtlasTrackerDBValidation,
  HCAAtlasTrackerDBValidationWithAtlasProperties,
  HCAAtlasTrackerEntrySheetValidation,
  HCAAtlasTrackerListEntrySheetValidation,
  HCAAtlasTrackerSourceDataset,
  HCAAtlasTrackerSourceStudy,
  HCAAtlasTrackerUser,
  HCAAtlasTrackerValidationRecord,
  HCAAtlasTrackerValidationRecordWithoutAtlases,
  TIER_ONE_METADATA_STATUS,
} from "./entities";
import {
  getCompositeTierOneMetadataStatus,
  getPublishedCitation,
  getUnpublishedCitation,
} from "./utils";

export function dbAtlasToApiAtlas(
  dbAtlas: HCAAtlasTrackerDBAtlasWithComponentAtlases
): HCAAtlasTrackerAtlas {
  return {
    bioNetwork: dbAtlas.overview.network,
    capId: dbAtlas.overview.capId,
    cellxgeneAtlasCollection: dbAtlas.overview.cellxgeneAtlasCollection,
    cellxgeneAtlasCollectionTitle:
      dbAtlas.overview.cellxgeneAtlasCollection &&
      (getCellxGeneCollectionInfoById(dbAtlas.overview.cellxgeneAtlasCollection)
        ?.title ??
        null),
    codeLinks: dbAtlas.overview.codeLinks,
    completedTaskCount: dbAtlas.overview.completedTaskCount,
    componentAtlasCount: dbAtlas.component_atlas_count,
    description: dbAtlas.overview.description,
    highlights: dbAtlas.overview.highlights,
    id: dbAtlas.id,
    ingestionTaskCounts: dbAtlas.overview.ingestionTaskCounts,
    integrationLead: dbAtlas.overview.integrationLead,
    metadataCorrectnessUrl: dbAtlas.overview.metadataCorrectnessUrl,
    metadataSpecificationTitle: dbAtlas.overview.metadataSpecificationTitle,
    metadataSpecificationUrl: dbAtlas.overview.metadataSpecificationUrl,
    publications: dbAtlas.overview.publications,
    shortName: dbAtlas.overview.shortName,
    sourceDatasetCount: dbAtlas.source_datasets.length,
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
      metadataSpreadsheets: dbSourceStudy.study_info.metadataSpreadsheets,
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
      metadataSpreadsheets: dbSourceStudy.study_info.metadataSpreadsheets,
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
    metadataSpreadsheetTitle: dbSourceDataset.sd_info.metadataSpreadsheetTitle,
    metadataSpreadsheetUrl: dbSourceDataset.sd_info.metadataSpreadsheetUrl,
    publicationString: getDbEntityCitation(dbSourceDataset),
    sourceStudyId: dbSourceDataset.source_study_id,
    sourceStudyTitle:
      studyInfo.publication?.title ?? studyInfo.unpublishedInfo?.title ?? null,
    suspensionType: dbSourceDataset.sd_info.suspensionType,
    tierOneMetadataStatus:
      getDbSourceDatasetTierOneMetadataStatus(dbSourceDataset),
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

export function dbEntrySheetValidationToApiModel(
  entrySheetValidation: HCAAtlasTrackerDBEntrySheetValidation
): HCAAtlasTrackerEntrySheetValidation {
  return {
    entrySheetId: entrySheetValidation.entry_sheet_id,
    entrySheetTitle: entrySheetValidation.entry_sheet_title,
    id: entrySheetValidation.id,
    lastSynced: entrySheetValidation.last_synced.toISOString(),
    lastUpdated: entrySheetValidation.last_updated,
    sourceStudyId: entrySheetValidation.source_study_id,
    validationReport: entrySheetValidation.validation_report,
    validationSummary: entrySheetValidation.validation_summary,
  };
}

export function dbEntrySheetValidationToApiListModel(
  entrySheetValidation: HCAAtlasTrackerDBEntrySheetValidationListFields
): HCAAtlasTrackerListEntrySheetValidation {
  return {
    entrySheetId: entrySheetValidation.entry_sheet_id,
    entrySheetTitle: entrySheetValidation.entry_sheet_title,
    id: entrySheetValidation.id,
    lastSynced: entrySheetValidation.last_synced.toISOString(),
    lastUpdated: entrySheetValidation.last_updated,
    sourceStudyId: entrySheetValidation.source_study_id,
    validationSummary: entrySheetValidation.validation_summary,
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

/**
 * Get the Tier 1 metadata status of the CELLxGENE dataset with the given ID.
 * @param cellxgeneDatasetId - CELLxGENE dataset ID.
 * @returns Tier 1 metadata status.
 */
export function getCellxGeneDatasetTierOneMetadataStatus(
  cellxgeneDatasetId: string
): TIER_ONE_METADATA_STATUS {
  return Object.hasOwn(savedCellxgeneInfo.datasets, cellxgeneDatasetId)
    ? savedCellxgeneInfo.datasets[cellxgeneDatasetId].tierOneStatus
    : TIER_ONE_METADATA_STATUS.NEEDS_VALIDATION;
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
 * Get the Tier 1 metadata status of the given source study's CELLxGENE collection.
 * @param sourceStudy - Source study.
 * @returns Tier 1 metadata status.
 */
export function getDbSourceStudyTierOneMetadataStatus(
  sourceStudy: HCAAtlasTrackerDBSourceStudy
): TIER_ONE_METADATA_STATUS {
  const collectionId = sourceStudy.study_info.cellxgeneCollectionId;
  return collectionId
    ? Object.hasOwn(savedCellxgeneInfo.collections, collectionId)
      ? getCompositeTierOneMetadataStatus(
          savedCellxgeneInfo.collections[collectionId].datasets.map(
            getCellxGeneDatasetTierOneMetadataStatus
          )
        )
      : TIER_ONE_METADATA_STATUS.NEEDS_VALIDATION
    : TIER_ONE_METADATA_STATUS.NA;
}

/**
 * Get the Tier 1 metadata status of the given source dataset's CELLxGENE dataset.
 * @param sourceDataset - Source dataset.
 * @returns Tier 1 metadata status.
 */
export function getDbSourceDatasetTierOneMetadataStatus(
  sourceDataset: HCAAtlasTrackerDBSourceDataset
): TIER_ONE_METADATA_STATUS {
  const datasetId = sourceDataset.sd_info.cellxgeneDatasetId;
  return datasetId
    ? getCellxGeneDatasetTierOneMetadataStatus(datasetId)
    : TIER_ONE_METADATA_STATUS.NA;
}
