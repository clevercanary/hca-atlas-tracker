import fsp from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";

const atlasesPath = "files/out/atlases.json";

let atlasesData: Buffer;

const entitiesLoaded = loadEntities();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  await entitiesLoaded;
  const type = req.query.type as string;
  if (type === "atlases") sendJsonData(res, atlasesData);
  else res.status(404).end();
}

function sendJsonData(res: NextApiResponse, data: Buffer): void {
  res.setHeader("Content-Type", "application/json").send(data);
}

async function loadEntities(): Promise<void> {
  atlasesData = await fsp.readFile(atlasesPath);
}
