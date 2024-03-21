import {
  ATLAS_STATUS,
  HCAAtlasTrackerAtlas,
} from "app/apis/catalog/hca-atlas-tracker/common/entities";
import fsp from "fs/promises";
import { TokenInfo } from "google-auth-library";
import pg from "pg";
import { getAuthClient } from "./auth-client-service";

const { Pool } = pg;

const atlasesPath = "files/out/atlases.json";

const authClient = getAuthClient();
const accessTokensInfo = new Map<string, TokenInfo>();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let atlases: HCAAtlasTrackerAtlas[];

const entitiesLoaded = loadEntities();

export async function getAtlases(
  userAccessToken: string | undefined
): Promise<HCAAtlasTrackerAtlas[]> {
  await entitiesLoaded;
  const accessTokenInfo = await getAccessTokenInfo(userAccessToken);
  const email = accessTokenInfo?.email;
  if (email && accessTokenInfo.email_verified) {
    const { rows } = await pool.query(
      "SELECT role FROM hat.users WHERE email=$1",
      [email]
    );
    if (rows[0]?.role === "CONTENT_ADMIN") return atlases;
  }
  return atlases.filter((atlas) => atlas.status === ATLAS_STATUS.PUBLIC);
}

async function loadEntities(): Promise<void> {
  atlases = Object.values(JSON.parse(await fsp.readFile(atlasesPath, "utf8")));
}

async function getAccessTokenInfo(
  authorization: string | undefined
): Promise<TokenInfo | null> {
  if (!authorization) return null;
  const token = /^Bearer (.+)$/.exec(authorization)?.[1];
  if (!token) return null;
  let tokenInfo = accessTokensInfo.get(token);
  if (!tokenInfo)
    accessTokensInfo.set(
      token,
      (tokenInfo = await authClient.getTokenInfo(token))
    );
  return tokenInfo;
}
