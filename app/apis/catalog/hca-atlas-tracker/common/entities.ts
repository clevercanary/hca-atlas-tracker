import { IntegratedAtlas } from "../../../../../files/build-component-atlases";
import { ProjectsResponse } from "../../../../../files/entities/responses";

export interface HCAAtlasTrackerAtlas {
  atlasKey: string;
  atlasTitle: string;
  bioNetwork: NetworkKey;
  componentAtlases: HCAAtlasTrackerComponentAtlas[];
  cxgId: string;
  datasetIds: string[];
  integrationLead: string;
  publication: string;
  sourceDatasets: HCAAtlasTrackerSourceDataset[];
  status: ATLAS_STATUS;
  version: string;
}

export type HCAAtlasTrackerComponentAtlas = IntegratedAtlas;

export type HCAAtlasTrackerSourceDataset = ProjectsResponse;

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
