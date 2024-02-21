import { HCAAtlasTrackerAtlas } from "./entities";

export function getAtlasId(atlas: HCAAtlasTrackerAtlas): string {
  return atlas.atlasTitle; // TODO use actual ID
}
