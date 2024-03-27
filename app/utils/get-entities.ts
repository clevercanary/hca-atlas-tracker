import fsp from "fs/promises";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerAtlas,
} from "../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { getUserRoleFromAuthorization } from "./api-handler";

const atlasesPath = "files/out/atlases.json";

let atlases: HCAAtlasTrackerAtlas[];

const entitiesLoaded = loadEntities();

/**
 * Get array of atlases accessible by the current user.
 * @param authorization - Authorization string for a logged-in user, or undefined for a logged-out user.
 * @returns array of atlas entities.
 */
export async function getAtlases(
  authorization: string | undefined
): Promise<HCAAtlasTrackerAtlas[]> {
  await entitiesLoaded;
  if ((await getUserRoleFromAuthorization(authorization)) === "CONTENT_ADMIN")
    return atlases;
  return atlases.filter((atlas) => atlas.status === ATLAS_STATUS.PUBLIC);
}

async function loadEntities(): Promise<void> {
  atlases = Object.values(JSON.parse(await fsp.readFile(atlasesPath, "utf8")));
}
