export interface HCAAtlasTrackerAtlas {
  atlasTitle: string;
  bioNetwork: NetworkKey;
  integrationLead: string;
  publication: string;
  status: ATLAS_STATUS;
  version: string;
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
