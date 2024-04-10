import {
  ATLAS_STATUS,
  NetworkKey,
  PublicationInfo,
  PUBLICATION_STATUS,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";

export interface TestUser {
  authorization: string;
  disabled: boolean;
  email: string;
  name: string;
  role: string;
  token: string;
}

export interface TestAtlas {
  id: string;
  network: NetworkKey;
  shortName: string;
  sourceDatasets: string[];
  status: ATLAS_STATUS;
  version: string;
}

export interface TestSourceDataset {
  doi: string | null;
  id: string;
  publication: PublicationInfo | null;
  publicationStatus: PUBLICATION_STATUS;
}
