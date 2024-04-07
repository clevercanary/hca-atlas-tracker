import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { NETWORK_KEYS } from "./constants";

export type HCAAtlasTrackerEntity =
  | HCAAtlasTrackerAtlas
  | HCAAtlasTrackerComponentAtlas
  | HCAAtlasTrackerSourceDataset;

export interface HCAAtlasTrackerAtlas {
  atlasId: string;
  atlasName: string;
  atlasTitle: string;
  bioNetwork: NetworkKey;
  codeUrl: string;
  componentAtlases: HCAAtlasTrackerComponentAtlas[];
  cxgCollectionId: string | null;
  description: MDXRemoteSerializeResult | null;
  focus: string;
  integrationLead: string;
  integrationLeadEmail: string;
  networkCoordinator: HCAAtlasTrackerNetworkCoordinator;
  publication: string;
  publicationUrl: string;
  sourceDatasets: HCAAtlasTrackerSourceDataset[];
  status: ATLAS_STATUS;
  version: string;
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
  anatomicalEntity: string[];
  atlasId: string;
  atlasTitle: string;
  bioNetwork: NetworkKey;
  capUrl: string | null;
  cxgCollectionId: string | null;
  donorDisease: string[];
  estimatedCellCount: number | null;
  inCap: string;
  inCellxGene: string;
  inHcaDataRepository: string;
  isPublished: string;
  libraryConstructionMethod: string[];
  projectId: string | null;
  projectTitle: string;
  publicationUrl: string | null;
  species: string[];
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
  focus: string;
  network: NetworkKey;
  version: string;
}

export interface HCAAtlasTrackerDBSourceDataset {
  created_at: Date;
  id: string;
  sd_info: HCAAtlasTrackerDBSourceDatasetInfo;
  updated_at: Date;
}

export interface HCAAtlasTrackerDBSourceDatasetInfo {
  publication: PublicationInfo | null;
  publicationStatus: PUBLICATION_STATUS;
}

export type AtlasId = HCAAtlasTrackerAtlas["atlasId"];

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
