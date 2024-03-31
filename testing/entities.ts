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
  id: string;
  network: NetworkKey;
  short_name: string;
  status: ATLAS_STATUS;
  version: string;
}
