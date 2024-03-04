import fsp from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";

const atlasesPath = "files/out/atlases.json";
const componentAtlasesPath = "files/out/component-atlases.json";
const sourceDatasetsPath = "files/out/source-datasets.json";

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
  if (type === "atlases") sendJsonData(res, atlasesData);
  else if (type === "component-atlases")
    sendJsonData(res, componentAtlasesData);
  else if (type === "source-datasets") sendJsonData(res, sourceDatasetsData);
  else res.status(404).end();
}

function sendJsonData(res: NextApiResponse, data: Buffer): void {
  res.setHeader("Content-Type", "application/json").send(data);
}

async function loadEntities(): Promise<void> {
  atlasesData = await fsp.readFile(atlasesPath);
  componentAtlasesData = await fsp.readFile(componentAtlasesPath);
  sourceDatasetsData = await fsp.readFile(sourceDatasetsPath);
}
