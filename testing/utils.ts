import { HCAAtlasTrackerDBAtlasOverview } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { TestAtlas, TestUser } from "./entities";

export function makeTestUser(
  nameId: string,
  role = "",
  disabled = false
): TestUser {
  return {
    authorization: `Bearer ${nameId}`,
    disabled,
    email: `${nameId}@example.com`,
    name: nameId,
    role,
    token: nameId,
  };
}

export function makeTestAtlasOverview(
  atlas: TestAtlas
): HCAAtlasTrackerDBAtlasOverview {
  return {
    network: atlas.network,
    shortName: atlas.shortName,
    version: atlas.version,
    wave: atlas.wave,
  };
}
