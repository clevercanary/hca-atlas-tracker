import { getAtlases } from "app/utils/get-entities";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const atlases = await getAtlases(req.headers.authorization);
  const atlas = atlases.find((atlas) => atlas.atlasKey === req.query.id);
  if (atlas) res.json(atlas);
  else res.status(404).end();
}
