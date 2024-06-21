import { API } from "./api";
import { NETWORK_KEYS, WAVES } from "./constants";

export type APIKey = keyof typeof API;
export type APIValue = (typeof API)[APIKey];

export interface HCAAtlasTrackerListAtlas {
  bioNetwork: NetworkKey;
  completedTaskCount: number;
  componentAtlasCount: number;
  id: string;
  integrationLeadEmail: IntegrationLead["email"][];
  integrationLeadName: IntegrationLead["name"][];
  name: string;
  publicationDoi: string;
  publicationPubString: string;
  shortName: string;
  sourceStudyCount: number;
  status: ATLAS_STATUS;
  targetCompletion: string;
  taskCount: number;
  title: string;
  version: string;
  wave: Wave;
}

export interface HCAAtlasTrackerAtlas {
  bioNetwork: NetworkKey;
  completedTaskCount: number;
  componentAtlasCount: number;
  id: string;
  integrationLead: IntegrationLead[];
  publication: {
    doi: string;
    pubString: string;
  };
  shortName: string;
  sourceStudyCount: number;
  status: ATLAS_STATUS;
  targetCompletion: string | null;
  taskCount: number;
  title: string;
  version: string;
  wave: Wave;
}

export interface HCAAtlasTrackerComponentAtlas {
  atlasId: string;
  cellxgeneDatasetId: string | null;
  cellxgeneDatasetVersion: string | null;
  id: string;
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
  sourceDatasetCount: number;
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
  publicationString: string;
  sourceStudyId: string;
  sourceStudyTitle: string | null;
  suspensionType: string[];
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
  taskStatus: TASK_STATUS;
  validationId: VALIDATION_ID;
  validationStatus: VALIDATION_STATUS;
  validationType: VALIDATION_TYPE;
}

export interface HCAAtlasTrackerValidationRecord
  extends HCAAtlasTrackerValidationResult {
  atlasNames: string[];
  atlasShortNames: string[];
  createdAt: string;
  id: string;
  networks: NetworkKey[];
  resolvedAt: string | null;
  targetCompletion: string | null;
  updatedAt: string;
  waves: Wave[];
}

export interface HCAAtlasTrackerActiveUser {
  email: string;
  fullName: string;
  role: ROLE;
}

export type DBEntityOfType<T extends ENTITY_TYPE> = T extends ENTITY_TYPE.ATLAS
  ? HCAAtlasTrackerDBAtlas
  : T extends ENTITY_TYPE.SOURCE_STUDY
  ? HCAAtlasTrackerDBSourceStudy
  : never;

export interface HCAAtlasTrackerDBAtlas {
  created_at: Date;
  id: string;
  overview: HCAAtlasTrackerDBAtlasOverview;
  source_studies: string[];
  status: ATLAS_STATUS;
  target_completion: Date | null;
  updated_at: Date;
}

export interface HCAAtlasTrackerDBAtlasWithComponentAtlases
  extends HCAAtlasTrackerDBAtlas {
  component_atlas_count: number;
}

export interface HCAAtlasTrackerDBAtlasOverview {
  completedTaskCount: number;
  integrationLead: IntegrationLead[];
  network: NetworkKey;
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
  cellxgeneDatasetId: string | null;
  cellxgeneDatasetVersion: string | null;
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
  publication: PublicationInfo | null;
  unpublishedInfo: null;
}

export interface HCAAtlasTrackerDBUnpublishedSourceStudyInfo {
  capId: string | null;
  cellxgeneCollectionId: string | null;
  doiStatus: DOI_STATUS;
  hcaProjectId: string | null;
  publication: null;
  unpublishedInfo: UnpublishedInfo;
}

export type HCAAtlasTrackerDBSourceStudyWithSourceDatasets =
  HCAAtlasTrackerDBSourceStudy & {
    source_dataset_count: number;
  };

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
  HCAAtlasTrackerDBSourceDataset &
    (
      | Pick<HCAAtlasTrackerDBPublishedSourceStudy, "doi" | "study_info">
      | Pick<HCAAtlasTrackerDBUnpublishedSourceStudy, "doi" | "study_info">
    );

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
  networks: NetworkKey[];
  waves: Wave[];
}

export interface HCAAtlasTrackerDBUser {
  disabled: boolean;
  email: string;
  full_name: string;
  id: number;
  last_login: Date;
  role: ROLE;
}

export type AtlasId = HCAAtlasTrackerAtlas["id"];

export type ComponentAtlasId = string;

export enum DOI_STATUS {
  DOI_NOT_ON_CROSSREF = "DOI_NOT_ON_CROSSREF",
  NA = "NA",
  OK = "OK",
}

export enum ATLAS_STATUS {
  DRAFT = "Draft",
  PUBLIC = "Public",
  REVISION = "Revision",
}

export interface Network {
  key: NetworkKey;
  name: string;
}

export type NetworkKey = (typeof NETWORK_KEYS)[number];

export type Wave = (typeof WAVES)[number];

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

export interface IntegrationLead {
  email: string;
  name: string;
}

export type SourceDatasetId = string;

export type SourceStudyId = string;

export interface ValidationDifference {
  actual: string | null;
  expected: string;
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

export enum VALIDATION_ID {
  SOURCE_STUDY_HCA_PROJECT_HAS_PRIMARY_DATA = "SOURCE_STUDY_HCA_PROJECT_HAS_PRIMARY_DATA",
  SOURCE_STUDY_IN_CAP = "SOURCE_STUDY_IN_CAP",
  SOURCE_STUDY_IN_CELLXGENE = "SOURCE_STUDY_IN_CELLXGENE",
  SOURCE_STUDY_IN_HCA_DATA_REPOSITORY = "SOURCE_STUDY_IN_HCA_DATA_REPOSITORY",
  SOURCE_STUDY_TITLE_MATCHES_HCA_DATA_REPOSITORY = "SOURCE_STUDY_TITLE_MATCHES_HCA_DATA_REPOSITORY",
}

export enum VALIDATION_STATUS {
  BLOCKED = "BLOCKED",
  FAILED = "FAILED",
  OVERRIDDEN = "OVERRIDDEN",
  PASSED = "PASSED",
}

export enum VALIDATION_VARIABLE {
  TITLE = "Title",
}

export enum ROLE {
  CONTENT_ADMIN = "CONTENT_ADMIN",
  STAKEHOLDER = "STAKEHOLDER",
  UNREGISTERED = "UNREGISTERED",
}
