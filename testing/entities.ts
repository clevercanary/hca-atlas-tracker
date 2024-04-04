import {
  ATLAS_STATUS,
  NetworkKey,
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
  focus: string;
  id: string;
  network: NetworkKey;
  sourceDatasets: string[];
  status: ATLAS_STATUS;
  version: string;
}
