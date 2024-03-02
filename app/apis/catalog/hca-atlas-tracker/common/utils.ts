import { HCAAtlasTrackerAtlas } from "./entities";

export function getAtlasId(atlas: HCAAtlasTrackerAtlas): string {
  return atlas.atlasKey;
}
