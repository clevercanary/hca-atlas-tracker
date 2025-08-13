import {
  EntrySheetValidationErrorInfo,
  EntrySheetValidationSummary,
  GoogleLastUpdateInfo,
} from "../../../../utils/hca-validation-tools/hca-validation-tools";
import { API } from "./api";
import { NETWORK_KEYS, WAVES } from "./constants";

export type APIKey = keyof typeof API;
export type APIValue = (typeof API)[APIKey];

export type HCAAtlasTrackerListAtlas = Omit<
  HCAAtlasTrackerAtlas,
  "integrationLead"
> & {
  integrationLeadEmail: IntegrationLead["email"][];
  integrationLeadName: IntegrationLead["name"][];
  name: string;
};

export interface HCAAtlasTrackerAtlas {
  bioNetwork: NetworkKey;
  capId: string | null;
  cellxgeneAtlasCollection: string | null;
  cellxgeneAtlasCollectionTitle: string | null;
  codeLinks: LinkInfo[];
  completedTaskCount: number;
  componentAtlasCount: number;
  description: string;
  entrySheetValidationCount: number;
  highlights: string;
  id: string;
  ingestionTaskCounts: IngestionTaskCounts;
  integrationLead: IntegrationLead[];
  metadataCorrectnessUrl: string | null;
  metadataSpecificationTitle: string | null;
  metadataSpecificationUrl: string | null;
  publications: DoiPublicationInfo[];
  shortName: string;
  sourceDatasetCount: number;
  sourceStudyCount: number;
  status: ATLAS_STATUS;
  targetCompletion: string | null;
  taskCount: number;
  title: string;
  version: string;
  wave: Wave;
}

export interface HCAAtlasTrackerComponentAtlas {
  assay: string[];
  atlasId: string;
  cellCount: number;
  cellxgeneDatasetId: string | null;
  cellxgeneDatasetVersion: string | null;
  description: string;
  disease: string[];
  id: string;
  sourceDatasetCount: number;
  suspensionType: string[];
  tissue: string[];
  title: string;
}

export interface HCAAtlasTrackerNetworkCoordinator {
  coordinatorNames: string[];
  email: string;
}

export type HCAAtlasTrackerSourceStudy =
  | HCAAtlasTrackerPublishedSourceStudy
  | HCAAtlasTrackerUnpublishedSourceStudy;

interface HCAAtlasTrackerSourceStudyCommon {
  capId: string | null;
  cellxgeneCollectionId: string | null;
  doiStatus: DOI_STATUS;
  hcaProjectId: string | null;
  id: string;
  metadataSpreadsheets: GoogleSheetInfo[];
  sourceDatasetCount: number;
  tasks: HCAAtlasTrackerValidationRecordWithoutAtlases[];
}

export interface HCAAtlasTrackerPublishedSourceStudy
  extends HCAAtlasTrackerSourceStudyCommon {
  contactEmail: null;
  doi: string;
  journal: string | null;
  publicationDate: string | null;
  referenceAuthor: string | null;
  title: string | null;
}

export interface HCAAtlasTrackerUnpublishedSourceStudy
  extends HCAAtlasTrackerSourceStudyCommon {
  contactEmail: string | null;
  doi: null;
  journal: null;
  publicationDate: null;
  referenceAuthor: string;
  title: string;
}

export interface HCAAtlasTrackerSourceDataset {
  assay: string[];
  cellCount: number;
  cellxgeneDatasetId: string | null;
  cellxgeneDatasetVersion: string | null;
  cellxgeneExplorerUrl: string | null;
  createdAt: string;
  disease: string[];
  doi: string | null;
  id: string;
  metadataSpreadsheetTitle: string | null;
  metadataSpreadsheetUrl: string | null;
  publicationString: string;
  sourceStudyId: string;
  sourceStudyTitle: string | null;
  suspensionType: string[];
  tierOneMetadataStatus: TIER_ONE_METADATA_STATUS;
  tissue: string[];
  title: string;
  updatedAt: string;
}

export interface HCAAtlasTrackerValidationResult {
  atlasIds: string[];
  description: string;
  differences: ValidationDifference[];
  doi: string | null;
  entityId: string;
  entityTitle: string;
  entityType: ENTITY_TYPE;
  publicationString: string | null;
  relatedEntityUrl: string | null;
  system: SYSTEM;
  validationId: VALIDATION_ID;
  validationStatus: VALIDATION_STATUS;
  validationType: VALIDATION_TYPE;
}

export interface HCAAtlasTrackerValidationRecord
  extends HCAAtlasTrackerValidationResult {
  atlasNames: string[];
  atlasShortNames: string[];
  atlasVersions: string[];
  commentThreadId: string | null;
  createdAt: string;
  id: string;
  networks: NetworkKey[];
  resolvedAt: string | null;
  targetCompletion: string | null;
  taskStatus: TASK_STATUS;
  updatedAt: string;
  waves: Wave[];
}

export type HCAAtlasTrackerValidationRecordWithoutAtlases = Omit<
  HCAAtlasTrackerValidationRecord,
  | "atlasIds"
  | "atlasNames"
  | "atlasShortNames"
  | "atlasVersions"
  | "networks"
  | "waves"
>;

export interface HCAAtlasTrackerEntrySheetValidation {
  entrySheetId: string;
  entrySheetTitle: string | null;
  id: string;
  lastSynced: string;
  lastUpdated: GoogleLastUpdateInfo | null;
  publicationString: string;
  sourceStudyId: string;
  validationReport: EntrySheetValidationErrorInfo[];
  validationSummary: EntrySheetValidationSummary;
}

export type HCAAtlasTrackerListEntrySheetValidation = Omit<
  HCAAtlasTrackerEntrySheetValidation,
  "validationReport"
>;

export interface HCAAtlasTrackerComment {
  createdAt: string;
  createdBy: number;
  id: string;
  text: string;
  threadId: string;
  updatedAt: string;
  updatedBy: number;
}

export interface HCAAtlasTrackerActiveUser {
  disabled: boolean;
  email: string;
  fullName: string;
  role: ROLE;
  roleAssociatedResourceIds: string[];
}

export interface HCAAtlasTrackerUser {
  disabled: boolean;
  email: string;
  fullName: string;
  id: number;
  lastLogin: string;
  role: ROLE;
  roleAssociatedResourceIds: string[];
  roleAssociatedResourceNames: string[];
}

export interface TaskStatusesUpdatedByDOIResult {
  notFound: string[];
  notUpdated: Record<TASK_STATUS, string[]>;
  updated: string[];
}

export type ValidationDBEntityOfType<T extends ENTITY_TYPE> =
  T extends ENTITY_TYPE.ATLAS
    ? HCAAtlasTrackerDBAtlas
    : T extends ENTITY_TYPE.SOURCE_STUDY
    ? HCAAtlasTrackerDBSourceStudyWithAtlasProperties
    : never;

export interface HCAAtlasTrackerDBAtlas {
  created_at: Date;
  id: string;
  overview: HCAAtlasTrackerDBAtlasOverview;
  source_datasets: string[];
  source_studies: string[];
  status: ATLAS_STATUS;
  target_completion: Date | null;
  updated_at: Date;
}

export interface HCAAtlasTrackerDBAtlasWithComponentAtlases
  extends HCAAtlasTrackerDBAtlas {
  component_atlas_count: number;
  entry_sheet_validation_count: number;
}

export interface HCAAtlasTrackerDBAtlasOverview {
  capId: string | null;
  cellxgeneAtlasCollection: string | null;
  codeLinks: LinkInfo[];
  completedTaskCount: number;
  description: string;
  highlights: string;
  ingestionTaskCounts: IngestionTaskCounts;
  integrationLead: IntegrationLead[];
  metadataCorrectnessUrl: string | null;
  metadataSpecificationTitle: string | null;
  metadataSpecificationUrl: string | null;
  network: NetworkKey;
  publications: DoiPublicationInfo[];
  shortName: string;
  taskCount: number;
  version: string;
  wave: Wave;
}

export interface HCAAtlasTrackerDBComponentAtlas {
  atlas_id: string;
  component_info: HCAAtlasTrackerDBComponentAtlasInfo;
  created_at: Date;
  id: string;
  source_datasets: string[];
  title: string;
  updated_at: Date;
}

export interface HCAAtlasTrackerDBComponentAtlasInfo {
  assay: string[];
  cellCount: number;
  cellxgeneDatasetId: string | null;
  cellxgeneDatasetVersion: string | null;
  description: string;
  disease: string[];
  suspensionType: string[];
  tissue: string[];
}

export interface HCAAtlasTrackerDBPublishedSourceStudy {
  created_at: Date;
  doi: string;
  id: string;
  study_info: HCAAtlasTrackerDBPublishedSourceStudyInfo;
  updated_at: Date;
}

export interface HCAAtlasTrackerDBUnpublishedSourceStudy {
  created_at: Date;
  doi: null;
  id: string;
  study_info: HCAAtlasTrackerDBUnpublishedSourceStudyInfo;
  updated_at: Date;
}

export type HCAAtlasTrackerDBSourceStudy =
  | HCAAtlasTrackerDBPublishedSourceStudy
  | HCAAtlasTrackerDBUnpublishedSourceStudy;

export type HCAAtlasTrackerDBSourceStudyMinimumColumns =
  | Pick<HCAAtlasTrackerDBPublishedSourceStudy, "doi" | "study_info">
  | Pick<HCAAtlasTrackerDBUnpublishedSourceStudy, "doi" | "study_info">;

export interface HCAAtlasTrackerDBPublishedSourceStudyInfo {
  capId: string | null;
  cellxgeneCollectionId: string | null;
  doiStatus: DOI_STATUS;
  hcaProjectId: string | null;
  metadataSpreadsheets: GoogleSheetInfo[];
  publication: PublicationInfo | null;
  unpublishedInfo: null;
}

export interface HCAAtlasTrackerDBUnpublishedSourceStudyInfo {
  capId: string | null;
  cellxgeneCollectionId: string | null;
  doiStatus: DOI_STATUS;
  hcaProjectId: string | null;
  metadataSpreadsheets: GoogleSheetInfo[];
  publication: null;
  unpublishedInfo: UnpublishedInfo;
}

export type HCAAtlasTrackerDBSourceStudyWithSourceDatasets =
  HCAAtlasTrackerDBSourceStudy & {
    source_dataset_count: number;
  };

export type HCAAtlasTrackerDBSourceStudyWithRelatedEntities =
  HCAAtlasTrackerDBSourceStudyWithSourceDatasets & {
    validations: HCAAtlasTrackerDBValidation[];
  };

export type HCAAtlasTrackerDBSourceStudyWithAtlasProperties =
  HCAAtlasTrackerDBSourceStudy & {
    atlas_names: string[];
    atlas_short_names: string[];
    atlas_versions: string[];
    networks: NetworkKey[];
  };

export type WithSourceStudyInfo<T = unknown> = T &
  (
    | Pick<HCAAtlasTrackerDBPublishedSourceStudy, "doi" | "study_info">
    | Pick<HCAAtlasTrackerDBUnpublishedSourceStudy, "doi" | "study_info">
  );

export interface HCAAtlasTrackerDBSourceDataset {
  created_at: Date;
  id: string;
  sd_info: HCAAtlasTrackerDBSourceDatasetInfo;
  source_study_id: string;
  updated_at: Date;
}

export interface HCAAtlasTrackerDBSourceDatasetInfo {
  assay: string[];
  cellCount: number;
  cellxgeneDatasetId: string | null;
  cellxgeneDatasetVersion: string | null;
  cellxgeneExplorerUrl: string | null;
  disease: string[];
  metadataSpreadsheetTitle: string | null;
  metadataSpreadsheetUrl: string | null;
  suspensionType: string[];
  tissue: string[];
  title: string;
}

export type HCAAtlasTrackerDBSourceDatasetWithCellxGeneId =
  HCAAtlasTrackerDBSourceDataset & {
    sd_info: HCAAtlasTrackerDBSourceDatasetInfo & {
      cellxgeneDatasetId: string;
    };
  };

export type HCAAtlasTrackerDBSourceDatasetWithStudyProperties =
  WithSourceStudyInfo<HCAAtlasTrackerDBSourceDataset>;

export interface HCAAtlasTrackerListValidationRecord
  extends Omit<HCAAtlasTrackerValidationRecord, "targetCompletion" | "doi"> {
  doi: string;
  targetCompletion: string;
}

export interface HCAAtlasTrackerDBValidationUpdateColumns {
  atlas_ids: string[];
  entity_id: string;
  resolved_at: Date | null;
  validation_id: VALIDATION_ID;
  validation_info: HCAAtlasTrackerDBValidationInfo;
}

export interface HCAAtlasTrackerDBValidation
  extends HCAAtlasTrackerDBValidationUpdateColumns {
  comment_thread_id: string | null;
  created_at: Date;
  id: string;
  target_completion: Date | null;
  updated_at: Date;
}

export interface HCAAtlasTrackerDBValidationInfo {
  description: string;
  differences: ValidationDifference[];
  doi: string | null;
  entityTitle: string;
  entityType: ENTITY_TYPE;
  publicationString: string | null;
  relatedEntityUrl: string | null;
  system: SYSTEM;
  taskStatus: TASK_STATUS;
  validationStatus: VALIDATION_STATUS;
  validationType: VALIDATION_TYPE;
}

export interface HCAAtlasTrackerDBValidationWithAtlasProperties
  extends HCAAtlasTrackerDBValidation {
  atlas_names: string[];
  atlas_short_names: string[];
  atlas_versions: string[];
  networks: NetworkKey[];
  waves: Wave[];
}

export interface HCAAtlasTrackerDBEntrySheetValidation {
  entry_sheet_id: string;
  entry_sheet_title: string | null;
  id: string;
  last_synced: Date;
  last_updated: GoogleLastUpdateInfo | null;
  source_study_id: string;
  validation_report: EntrySheetValidationErrorInfo[];
  validation_summary: EntrySheetValidationSummary;
}

// Specified using `Pick` rather than `Omit` in order to correspond more closely to how it's queried in Postgres
export type HCAAtlasTrackerDBEntrySheetValidationListFields = Pick<
  HCAAtlasTrackerDBEntrySheetValidation,
  | "entry_sheet_id"
  | "entry_sheet_title"
  | "id"
  | "last_synced"
  | "last_updated"
  | "source_study_id"
  | "validation_summary"
>;

export interface HCAAtlasTrackerDBComment {
  created_at: Date;
  created_by: number;
  id: string;
  text: string;
  thread_id: string;
  updated_at: Date;
  updated_by: number;
}

export interface HCAAtlasTrackerDBUser {
  disabled: boolean;
  email: string;
  full_name: string;
  id: number;
  last_login: Date;
  role: ROLE;
  role_associated_resource_ids: string[];
}

export type HCAAtlasTrackerDBUserWithAssociatedResources =
  HCAAtlasTrackerDBUser & {
    role_associated_resource_names: string[];
  };

export interface Heatmap {
  classes: HeatmapClass[];
}

export interface HeatmapClass {
  fields: HeatmapField[];
  sheets: HeatmapEntrySheet[];
  title: string;
}

export interface HeatmapField {
  name: string;
  organSpecific: boolean;
  required: boolean;
  title: string;
}

export interface HeatmapEntrySheet {
  correctness: {
    correctCounts: Record<string, number>;
    rowCount: number;
  } | null;
  title: string;
}

export type AtlasId = HCAAtlasTrackerAtlas["id"];

export type ComponentAtlasId = string;

export type EntrySheetValidationId = HCAAtlasTrackerEntrySheetValidation["id"];

export enum DOI_STATUS {
  DOI_NOT_ON_CROSSREF = "DOI_NOT_ON_CROSSREF",
  NA = "NA",
  OK = "OK",
}

export enum ATLAS_STATUS {
  IN_PROGRESS = "IN_PROGRESS",
  OC_ENDORSED = "OC_ENDORSED",
}

export interface Network {
  key: NetworkKey;
  name: string;
}

export type NetworkKey = (typeof NETWORK_KEYS)[number];

export type Wave = (typeof WAVES)[number];

export interface DoiPublicationInfo {
  doi: string;
  publication: PublicationInfo | null;
}

export interface PublicationInfo {
  authors: Author[];
  hasPreprintDoi: string | null;
  journal: string;
  preprintOfDoi: string | null;
  publicationDate: string;
  title: string;
}

export interface UnpublishedInfo {
  contactEmail: string | null;
  referenceAuthor: string;
  title: string;
}

export interface Author {
  name: string;
  personalName: string | null;
}

export type IngestionTaskCounts = Record<
  SYSTEM.CAP | SYSTEM.CELLXGENE | SYSTEM.HCA_DATA_REPOSITORY,
  {
    completedCount: number;
    count: number;
  }
>;

export interface IntegrationLead {
  email: string;
  name: string;
}

export interface LinkInfo {
  label?: string;
  url: string;
}

export interface GoogleSheetInfo {
  id: string;
  title: string | null;
}

export type SourceDatasetId = string;

export type SourceStudyId = string;

export enum TIER_ONE_METADATA_STATUS {
  COMPLETE = "COMPLETE",
  INCOMPLETE = "INCOMPLETE",
  MISSING = "MISSING",
  NA = "NA",
  NEEDS_VALIDATION = "NEEDS_VALIDATION",
}

export type UserId = number;

export interface ValidationDifference {
  actual: string | string[] | null;
  expected: string | string[];
  variable: VALIDATION_VARIABLE;
}

export enum ENTITY_TYPE {
  ATLAS = "ATLAS",
  COMPONENT_ATLAS = "COMPONENT_ATLAS",
  SOURCE_STUDY = "SOURCE_STUDY",
}

export enum SYSTEM {
  CAP = "CAP",
  CELLXGENE = "CELLXGENE",
  DUOS = "DUOS",
  HCA_DATA_REPOSITORY = "HCA_DATA_REPOSITORY",
}

export enum TASK_STATUS {
  BLOCKED = "BLOCKED",
  DONE = "DONE",
  IN_PROGRESS = "IN_PROGRESS",
  TODO = "TODO",
}

export enum VALIDATION_TYPE {
  INGEST = "INGEST",
  METADATA = "METADATA",
}

export enum VALIDATION_DESCRIPTION {
  ADD_PRIMARY_DATA = "Add primary data.",
  ADD_TIER_ONE_METADATA = "Ingest Tier 1 metadata.",
  INGEST_SOURCE_STUDY = "Ingest source study.",
  LINK_PROJECT_BIONETWORKS_AND_ATLASES = "Link project to HCA BioNeworks and Atlases.",
  UPDATE_TITLE_TO_MATCH_PUBLICATION = "Update project title to match publication title.",
}

export enum VALIDATION_ID {
  SOURCE_STUDY_CELLXGENE_DATASETS_HAVE_TIER_ONE_METADATA = "SOURCE_STUDY_CELLXGENE_DATASETS_HAVE_TIER_ONE_METADATA",
  SOURCE_STUDY_HCA_PROJECT_HAS_LINKED_BIONETWORKS_AND_ATLASES = "SOURCE_STUDY_HCA_PROJECT_HAS_LINKED_BIONETWORKS_AND_ATLASES",
  SOURCE_STUDY_HCA_PROJECT_HAS_PRIMARY_DATA = "SOURCE_STUDY_HCA_PROJECT_HAS_PRIMARY_DATA",
  SOURCE_STUDY_IN_CAP = "SOURCE_STUDY_IN_CAP",
  SOURCE_STUDY_IN_CELLXGENE = "SOURCE_STUDY_IN_CELLXGENE",
  SOURCE_STUDY_IN_HCA_DATA_REPOSITORY = "SOURCE_STUDY_IN_HCA_DATA_REPOSITORY",
  SOURCE_STUDY_TITLE_MATCHES_HCA_DATA_REPOSITORY = "SOURCE_STUDY_TITLE_MATCHES_HCA_DATA_REPOSITORY",
}

export enum VALIDATION_STATUS {
  BLOCKED = "BLOCKED",
  FAILED = "FAILED",
  PASSED = "PASSED",
}

export enum VALIDATION_VARIABLE {
  ATLASES = "Atlases",
  NETWORKS = "Networks",
  TITLE = "Title",
}

export enum ROLE {
  CELLXGENE_ADMIN = "CELLXGENE_ADMIN",
  CONTENT_ADMIN = "CONTENT_ADMIN",
  INTEGRATION_LEAD = "INTEGRATION_LEAD",
  STAKEHOLDER = "STAKEHOLDER",
  UNREGISTERED = "UNREGISTERED",
}
