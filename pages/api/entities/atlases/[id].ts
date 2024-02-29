import { HCAAtlasTrackerAtlas } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import fsp from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";

const atlasesPath = "files/out/atlases.json";

let atlases: Record<number, HCAAtlasTrackerAtlas>;

const atlasesLoaded = loadAtlases();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  await atlasesLoaded;
  res.json(
    Object.values(atlases).find((atlas) => atlas.atlasKey === req.query.id)
  );
}

async function loadAtlases(): Promise<void> {
  atlases = JSON.parse(await fsp.readFile(atlasesPath, "utf8"));
}
