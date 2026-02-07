import {
  EntrySheetValidationErrorInfo,
  EntrySheetValidationSummary,
  GoogleLastUpdateInfo,
} from "../../../../utils/hca-validation-tools/hca-validation-tools";
import { API } from "./api";
import { FILE_VALIDATOR_NAMES, NETWORK_KEYS, WAVES } from "./constants";

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
  capUrl: string | null;
  cellCount: number;
  disease: string[];
  fileEventTime: string;
  fileId: string;
  fileName: string;
  geneCount: number | null;
  id: string;
  integrityStatus: INTEGRITY_STATUS;
  isArchived: boolean;
  sizeBytes: number;
  sourceDatasetCount: number;
  suspensionType: string[];
  tissue: string[];
  title: string;
  validationStatus: FILE_VALIDATION_STATUS;
  validationSummary: FileValidationSummary | null;
  wipNumber: number;
}

export interface HCAAtlasTrackerDetailComponentAtlas extends HCAAtlasTrackerComponentAtlas {
  validationReports: FileValidationReports | null;
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

export interface HCAAtlasTrackerPublishedSourceStudy extends HCAAtlasTrackerSourceStudyCommon {
  contactEmail: null;
  doi: string;
  journal: string | null;
  publicationDate: string | null;
  referenceAuthor: string | null;
  title: string | null;
}

export interface HCAAtlasTrackerUnpublishedSourceStudy extends HCAAtlasTrackerSourceStudyCommon {
  contactEmail: string | null;
  doi: null;
  journal: null;
  publicationDate: null;
  referenceAuthor: string;
  title: string;
}

export interface HCAAtlasTrackerSourceDataset {
  assay: string[];
  capUrl: string | null;
  cellCount: number;
  createdAt: string;
  disease: string[];
  doi: string | null;
  fileEventTime: string;
  fileId: string;
  fileName: string;
  geneCount: number | null;
  id: string;
  isArchived: boolean;
  metadataSpreadsheetTitle: string | null;
  metadataSpreadsheetUrl: string | null;
  publicationStatus: PUBLICATION_STATUS;
  publicationString: string;
  reprocessedStatus: REPROCESSED_STATUS;
  sizeBytes: number;
  sourceStudyId: string | null;
  sourceStudyTitle: string | null;
  suspensionType: string[];
  tissue: string[];
  title: string;
  updatedAt: string;
  validationStatus: FILE_VALIDATION_STATUS;
  validationSummary: FileValidationSummary | null;
  wipNumber: number;
}

export interface HCAAtlasTrackerDetailSourceDataset extends HCAAtlasTrackerSourceDataset {
  validationReports: FileValidationReports | null;
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

export interface HCAAtlasTrackerValidationRecord extends HCAAtlasTrackerValidationResult {
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
  component_atlases: string[];
  created_at: Date;
  id: string;
  overview: HCAAtlasTrackerDBAtlasOverview;
  source_datasets: string[];
  source_studies: string[];
  status: ATLAS_STATUS;
  target_completion: Date | null;
  updated_at: Date;
}

export interface HCAAtlasTrackerDBAtlasForAPI extends HCAAtlasTrackerDBAtlas {
  component_atlas_count: number;
  entry_sheet_validation_count: number;
  source_dataset_count: number;
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
  component_info: HCAAtlasTrackerDBComponentAtlasInfo;
  created_at: Date;
  file_id: string;
  id: string;
  is_latest: boolean;
  source_datasets: string[];
  updated_at: Date;
  version_id: string;
  wip_number: number;
}

export interface HCAAtlasTrackerDBComponentAtlasInfo {
  capUrl: string | null;
}

export interface HCAAtlasTrackerDBConcept {
  atlas_short_name: string;
  base_filename: string;
  created_at: Date;
  file_type: FILE_TYPE;
  generation: number;
  id: string;
  network: NetworkKey;
}

export type HCAAtlasTrackerDBComponentAtlasForAPI =
  HCAAtlasTrackerDBComponentAtlas &
    Pick<
      HCAAtlasTrackerDBFile,
      | "dataset_info"
      | "event_info"
      | "integrity_status"
      | "is_archived"
      | "key"
      | "size_bytes"
      | "validation_status"
      | "validation_summary"
    > & { file_id: string; source_dataset_count: number };

export type HCAAtlasTrackerDBComponentAtlasForDetailAPI =
  HCAAtlasTrackerDBComponentAtlasForAPI &
    Pick<HCAAtlasTrackerDBFile, "validation_reports">;

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

export type WithSourceStudyInfo<T = unknown, TAltValue = never> = T &
  (
    | Pick<HCAAtlasTrackerDBPublishedSourceStudy, "doi" | "study_info">
    | Pick<HCAAtlasTrackerDBUnpublishedSourceStudy, "doi" | "study_info">
    | { doi: TAltValue; study_info: TAltValue }
  );

export interface HCAAtlasTrackerDBSourceDataset {
  created_at: Date;
  file_id: string;
  id: string;
  is_latest: boolean;
  reprocessed_status: REPROCESSED_STATUS;
  sd_info: HCAAtlasTrackerDBSourceDatasetInfo;
  source_study_id: string | null;
  updated_at: Date;
  version_id: string;
  wip_number: number;
}

export interface HCAAtlasTrackerDBSourceDatasetInfo {
  capUrl: string | null;
  metadataSpreadsheetTitle: string | null;
  metadataSpreadsheetUrl: string | null;
  publicationStatus: PUBLICATION_STATUS;
}

export type HCAAtlasTrackerDBSourceDatasetForAPI = WithSourceStudyInfo<
  HCAAtlasTrackerDBSourceDataset,
  null
> &
  Pick<
    HCAAtlasTrackerDBFile,
    | "key"
    | "size_bytes"
    | "dataset_info"
    | "event_info"
    | "is_archived"
    | "validation_status"
    | "validation_summary"
  > & { file_id: string };

export type HCAAtlasTrackerDBSourceDatasetForDetailAPI =
  HCAAtlasTrackerDBSourceDatasetForAPI &
    Pick<HCAAtlasTrackerDBFile, "validation_reports">;

export interface HCAAtlasTrackerDBFile {
  bucket: string;
  concept_id: string | null;
  created_at: Date;
  dataset_info: HCAAtlasTrackerDBFileDatasetInfo | null;
  etag: string;
  event_info: FileEventInfo;
  file_type: FILE_TYPE;
  id: string;
  integrity_checked_at: Date | null;
  integrity_error: string | null;
  integrity_status: INTEGRITY_STATUS;
  is_archived: boolean;
  is_latest: boolean;
  key: string;
  sha256_client: string | null;
  sha256_server: string | null;
  size_bytes: string;
  sns_message_id: string;
  source_study_id: string | null;
  updated_at: Date;
  validation_info: HCAAtlasTrackerDBFileValidationInfo | null;
  validation_reports: FileValidationReports | null;
  validation_status: FILE_VALIDATION_STATUS;
  validation_summary: FileValidationSummary | null;
  version_id: string | null;
}

export interface HCAAtlasTrackerDBFileDatasetInfo {
  assay: string[];
  cellCount: number;
  disease: string[];
  geneCount?: number;
  suspensionType: string[];
  tissue: string[];
  title: string;
}

export interface HCAAtlasTrackerDBFileValidationInfo {
  batchJobId: string;
  snsMessageId: string;
  snsMessageTime: string;
}

export interface HCAAtlasTrackerListValidationRecord extends Omit<
  HCAAtlasTrackerValidationRecord,
  "targetCompletion" | "doi"
> {
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

export interface HCAAtlasTrackerDBValidation extends HCAAtlasTrackerDBValidationUpdateColumns {
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

export interface HCAAtlasTrackerDBValidationWithAtlasProperties extends HCAAtlasTrackerDBValidation {
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

export type FileId =
  | HCAAtlasTrackerComponentAtlas["fileId"]
  | HCAAtlasTrackerSourceDataset["fileId"];

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

export interface FileEventInfo {
  eventName: string;
  eventTime: string;
}

export type FileValidationReports = Partial<
  Record<FileValidatorName, FileValidationReport>
>;

export interface FileValidationReport {
  errors: string[];
  finishedAt: string;
  startedAt: string;
  valid: boolean;
  warnings: string[];
}

export interface FileValidationSummary {
  overallValid: boolean;
  validators: Partial<Record<FileValidatorName, boolean>>;
}

export type FileValidatorName = (typeof FILE_VALIDATOR_NAMES)[number];

export interface PresignedUrlInfo {
  url: string;
}

export type UserId = number;

export type ValidatorName = FileValidatorName;

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

export enum FILE_TYPE {
  INGEST_MANIFEST = "ingest_manifest",
  INTEGRATED_OBJECT = "integrated_object",
  SOURCE_DATASET = "source_dataset",
}

export enum FILE_VALIDATION_STATUS {
  COMPLETED = "completed",
  JOB_FAILED = "job_failed",
  PENDING = "pending",
  REQUEST_FAILED = "request_failed",
  REQUESTED = "requested",
  STALE = "stale",
}

export enum INTEGRITY_STATUS {
  ERROR = "error",
  INVALID = "invalid",
  PENDING = "pending",
  REQUESTED = "requested",
  VALID = "valid",
}

export enum REPROCESSED_STATUS {
  ORIGINAL = "Original",
  REPROCESSED = "Reprocessed",
  UNSPECIFIED = "Unspecified",
}

export enum PUBLICATION_STATUS {
  PUBLISHED = "Published",
  UNPUBLISHED = "Unpublished",
  UNSPECIFIED = "Unspecified",
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
