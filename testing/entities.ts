import {
  ATLAS_STATUS,
  DOI_STATUS,
  HCAAtlasTrackerDBUnpublishedSourceDatasetInfo,
  IntegrationLead,
  NetworkKey,
  PublicationInfo,
  ROLE,
  Wave,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";

export interface TestUser {
  authorization: string;
  disabled: boolean;
  email: string;
  name: string;
  role: ROLE;
  token: string;
}

export interface TestAtlas {
  id: string;
  integrationLead: IntegrationLead[];
  network: NetworkKey;
  shortName: string;
  sourceDatasets: string[];
  status: ATLAS_STATUS;
  targetCompletion?: Date;
  version: string;
  wave: Wave;
}

export type TestSourceDataset =
  | TestPublishedSourceDataset
  | TestUnpublishedSourceDataset;

export interface TestPublishedSourceDataset {
  capId?: string;
  doi: string | null;
  doiStatus: DOI_STATUS;
  id: string;
  publication: PublicationInfo | null;
}

export interface TestUnpublishedSourceDataset {
  cellxgeneCollectionId: string | null;
  hcaProjectId: string | null;
  id: string;
  unpublishedInfo: HCAAtlasTrackerDBUnpublishedSourceDatasetInfo["unpublishedInfo"];
}
