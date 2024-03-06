export type HCAAtlasTrackerEntity =
  | HCAAtlasTrackerAtlas
  | HCAAtlasTrackerComponentAtlas
  | HCAAtlasTrackerSourceDataset;

export interface HCAAtlasTrackerAtlas {
  atlasKey: string;
  atlasTitle: string;
  bioNetwork: NetworkKey;
  componentAtlases: HCAAtlasTrackerComponentAtlas[];
  cxgCollectionId: string;
  integrationLead: string;
  publication: string;
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

export interface HCAAtlasTrackerSourceDataset {
  anatomicalEntity: string[];
  atlasKey: string;
  atlasTitle: string;
  bioNetwork: NetworkKey;
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
  PUBLISHED = "Published",
}

export interface Network {
  key: NetworkKey;
  name: string;
}

export type NetworkKey =
  | "adipose"
  | "breast"
  | "development"
  | "eye"
  | "genetic-diversity"
  | "gut"
  | "heart"
  | "immune"
  | "kidney"
  | "liver"
  | "lung"
  | "musculoskeletal"
  | "nervous-system"
  | "oral"
  | "organoid"
  | "pancreas"
  | "reproduction"
  | "skin";
