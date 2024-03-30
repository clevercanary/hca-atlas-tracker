import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { NETWORK_KEYS } from "./constants";

export type HCAAtlasTrackerEntity =
  | HCAAtlasTrackerAtlas
  | HCAAtlasTrackerComponentAtlas
  | HCAAtlasTrackerSourceDataset;

export interface HCAAtlasTrackerAtlas {
  atlasKey: string;
  atlasTitle: string;
  bioNetwork: NetworkKey;
  codeUrl: string;
  componentAtlases: HCAAtlasTrackerComponentAtlas[];
  cxgCollectionId: string | null;
  description: MDXRemoteSerializeResult | null;
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
  atlasKey: string;
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
  atlasKey: string;
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
