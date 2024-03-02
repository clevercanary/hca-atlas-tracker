import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerComponentAtlas,
} from "./entities";

export function getAtlasId(atlas: HCAAtlasTrackerAtlas): string {
  return atlas.atlasKey;
}

export function getComponentAtlasId(
  componentAtlas: HCAAtlasTrackerComponentAtlas
): string {
  return componentAtlas.cxgDatasetId;
}
