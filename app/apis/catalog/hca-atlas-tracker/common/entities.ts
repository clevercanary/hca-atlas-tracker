import { NETWORK_KEYS, WAVES } from "./constants";

export interface HCAAtlasTrackerListAtlas {
  bioNetwork: NetworkKey;
  id: string;
  integrationLeadEmail: IntegrationLead["email"] | null;
  integrationLeadName: IntegrationLead["name"] | null;
  name: string;
  publicationDoi: string;
  publicationPubString: string;
  shortName: string;
  status: ATLAS_STATUS;
  title: string;
  version: string;
  wave: Wave;
}

export interface HCAAtlasTrackerAtlas {
  bioNetwork: NetworkKey;
  id: string;
  integrationLead: IntegrationLead | null;
  publication: {
    doi: string;
    pubString: string;
  };
  shortName: string;
  sourceDatasetCount: number;
  status: ATLAS_STATUS;
  title: string;
  version: string;
  wave: Wave;
}

export interface HCAAtlasTrackerComponentAtlas {
  atlasId: string;
  atlasTitle: string;
  bioNetwork: NetworkKey;
  cellCount: number;
  componentAtlasName: string;
  cxgCollectionId: string;
  cxgDatasetId: string;
  cxgExploreUrl: string;
  disease: string[];
  tissue: string[];
}

export interface HCAAtlasTrackerNetworkCoordinator {
  coordinatorNames: string[];
  email: string;
}

export type HCAAtlasTrackerSourceDataset =
  | HCAAtlasTrackerPublishedSourceDataset
  | HCAAtlasTrackerUnpublishedSourceDataset;

interface HCAAtlasTrackerSourceDatasetCommon {
  capId: string | null;
  cellxgeneCollectionId: string | null;
  doiStatus: DOI_STATUS;
  hcaProjectId: string | null;
  id: string;
}

export interface HCAAtlasTrackerPublishedSourceDataset
  extends HCAAtlasTrackerSourceDatasetCommon {
  contactEmail: null;
  doi: string;
  journal: string | null;
  publicationDate: string | null;
  referenceAuthor: string | null;
  title: string | null;
}

export interface HCAAtlasTrackerUnpublishedSourceDataset
  extends HCAAtlasTrackerSourceDatasetCommon {
  contactEmail: string | null;
  doi: null;
  journal: null;
  publicationDate: null;
  referenceAuthor: string;
  title: string;
}

export interface HCAAtlasTrackerActiveUser {
  email: string;
  fullName: string;
  role: ROLE;
}

export type DBEntityOfType<T extends ENTITY_TYPE> = T extends ENTITY_TYPE.ATLAS
  ? HCAAtlasTrackerDBAtlas
  : T extends ENTITY_TYPE.SOURCE_DATASET
  ? HCAAtlasTrackerDBSourceDataset
  : never;

export interface HCAAtlasTrackerDBAtlas {
  created_at: Date;
  id: string;
  overview: HCAAtlasTrackerDBAtlasOverview;
  source_datasets: string[];
  status: ATLAS_STATUS;
  updated_at: Date;
}

export interface HCAAtlasTrackerDBAtlasOverview {
  integrationLead: IntegrationLead | null;
  network: NetworkKey;
  shortName: string;
  version: string;
  wave: Wave;
}

export interface HCAAtlasTrackerDBPublishedSourceDataset {
  created_at: Date;
  doi: string;
  id: string;
  sd_info: HCAAtlasTrackerDBPublishedSourceDatasetInfo;
  updated_at: Date;
}

export interface HCAAtlasTrackerDBUnpublishedSourceDataset {
  created_at: Date;
  doi: null;
  id: string;
  sd_info: HCAAtlasTrackerDBUnpublishedSourceDatasetInfo;
  updated_at: Date;
}

export type HCAAtlasTrackerDBSourceDataset =
  | HCAAtlasTrackerDBPublishedSourceDataset
  | HCAAtlasTrackerDBUnpublishedSourceDataset;

export type HCAAtlasTrackerDBSourceDatasetMinimumColumns =
  | Pick<HCAAtlasTrackerDBPublishedSourceDataset, "doi" | "sd_info">
  | Pick<HCAAtlasTrackerDBUnpublishedSourceDataset, "doi" | "sd_info">;

export interface HCAAtlasTrackerDBPublishedSourceDatasetInfo {
  cellxgeneCollectionId: string | null;
  doiStatus: DOI_STATUS;
  hcaProjectId: string | null;
  publication: PublicationInfo | null;
  unpublishedInfo: null;
}

export interface HCAAtlasTrackerDBUnpublishedSourceDatasetInfo {
  cellxgeneCollectionId: string | null;
  doiStatus: DOI_STATUS;
  hcaProjectId: string | null;
  publication: null;
  unpublishedInfo: {
    contactEmail: string | null;
    referenceAuthor: string;
    title: string;
  };
}

export interface HCAAtlasTrackerValidationResult {
  atlasIds: string[];
  description: string;
  entityId: string;
  entityTitle: string;
  entityType: ENTITY_TYPE;
  system: SYSTEM;
  taskStatus: TASK_STATUS;
  validationId: VALIDATION_ID;
  validationStatus: VALIDATION_STATUS;
  validationType: VALIDATION_TYPE;
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

export interface Author {
  name: string;
  personalName: string | null;
}

export interface IntegrationLead {
  email: string;
  name: string;
}

export type SourceDatasetId = string;

export enum ENTITY_TYPE {
  ATLAS = "ATLAS",
  COMPONENT_ATLAS = "COMPONENT_ATLAS",
  SOURCE_DATASET = "SOURCE_DATASET",
}

export enum SYSTEM {
  CAP = "CAP",
  CELLXGENE = "CELLXGENE",
  DUOS = "DUOS",
  HCA_DATA_REPOSITORY = "HCA_DATA_REPOSITORY",
}

export enum TASK_STATUS {
  DONE = "DONE",
  IN_PROGRESS = "IN_PROGRESS",
  TODO = "TODO",
}

export enum VALIDATION_TYPE {
  INGEST = "INGEST",
  METADATA = "METADATA",
}

export enum VALIDATION_ID {
  SOURCE_DATASET_IN_CELLXGENE = "SOURCE_DATASET_IN_CELLXGENE",
  SOURCE_DATASET_IN_HCA_DATA_REPOSITORY = "SOURCE_DATASET_IN_HCA_DATA_REPOSITORY",
  SOURCE_DATASET_TITLE_MATCHES_HCA_DATA_REPOSITORY = "SOURCE_DATASET_TITLE_MATCHES_HCA_DATA_REPOSITORY",
}

export enum VALIDATION_STATUS {
  FAILED = "FAILED",
  OVERRIDDEN = "OVERRIDDEN",
  PASSED = "PASSED",
}

export enum ROLE {
  CONTENT_ADMIN = "CONTENT_ADMIN",
  STAKEHOLDER = "STAKEHOLDER",
  UNREGISTERED = "UNREGISTERED",
}
