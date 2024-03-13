import fsp from "fs/promises";
import { OAuth2Client, TokenInfo } from "google-auth-library";
import { NextApiRequest, NextApiResponse } from "next";

const atlasesPath = "files/out/atlases.json";
const componentAtlasesPath = "files/out/component-atlases.json";
const sourceDatasetsPath = "files/out/source-datasets.json";

const authClient = new OAuth2Client();
const accessTokensInfo = new Map<string, TokenInfo>();

let atlasesData: Buffer;
let componentAtlasesData: Buffer;
let sourceDatasetsData: Buffer;

const entitiesLoaded = loadEntities();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  await entitiesLoaded;
  const type = req.query.type as string;
  const accessTokenInfo = await getAccessTokenInfo(req.headers.authorization);
  console.log(accessTokenInfo?.email, accessTokenInfo?.email_verified);
  if (type === "atlases") sendJsonData(res, atlasesData);
  else if (type === "component-atlases")
    sendJsonData(res, componentAtlasesData);
  else if (type === "source-datasets") sendJsonData(res, sourceDatasetsData);
  else res.status(404).end();
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

function sendJsonData(res: NextApiResponse, data: Buffer): void {
  res.setHeader("Content-Type", "application/json").send(data);
}

async function loadEntities(): Promise<void> {
  atlasesData = await fsp.readFile(atlasesPath);
  componentAtlasesData = await fsp.readFile(componentAtlasesPath);
  sourceDatasetsData = await fsp.readFile(sourceDatasetsPath);
}
