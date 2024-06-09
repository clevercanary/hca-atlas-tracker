import {
  ATLAS_STATUS,
  DOI_STATUS,
  HCAAtlasTrackerDBUnpublishedSourceStudyInfo,
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
  sourceStudies: string[];
  status: ATLAS_STATUS;
  targetCompletion?: Date;
  version: string;
  wave: Wave;
}

export interface TestComponentAtlas {
  atlasId: string;
  id: string;
  sourceDatasets?: string[];
  title: string;
}

export type TestSourceStudy =
  | TestPublishedSourceStudy
  | TestUnpublishedSourceStudy;

export interface TestPublishedSourceStudy {
  capId?: string;
  doi: string | null;
  doiStatus: DOI_STATUS;
  id: string;
  publication: PublicationInfo | null;
}

export interface TestUnpublishedSourceStudy {
  cellxgeneCollectionId: string | null;
  hcaProjectId: string | null;
  id: string;
  unpublishedInfo: HCAAtlasTrackerDBUnpublishedSourceStudyInfo["unpublishedInfo"];
}

export interface TestSourceDataset {
  cellxgeneDatasetId?: string;
  cellxgeneDatasetVersion?: string;
  id: string;
  sourceStudyId: string;
  title: string;
}
