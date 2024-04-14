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

export interface HCAAtlasTrackerSourceDataset {
  capId: string | null;
  cellxgeneCollectionId: string | null;
  doi: string | null;
  firstAuthorPrimaryName: string | null;
  hcaProjectId: string | null;
  id: string;
  journal: string | null;
  publicationDate: string | null;
  publicationStatus: PUBLICATION_STATUS;
  title: string | null;
}

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

export interface HCAAtlasTrackerDBSourceDataset {
  created_at: Date;
  doi: string | null;
  id: string;
  sd_info: HCAAtlasTrackerDBSourceDatasetInfo;
  updated_at: Date;
}

export interface HCAAtlasTrackerDBSourceDatasetInfo {
  hcaProjectId: string | null;
  publication: PublicationInfo | null;
  publicationStatus: PUBLICATION_STATUS;
}

export type AtlasId = HCAAtlasTrackerAtlas["id"];

export enum PUBLICATION_STATUS {
  DOI_NOT_ON_CROSSREF = "DOI_NOT_ON_CROSSREF",
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
  journal: string | null;
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
