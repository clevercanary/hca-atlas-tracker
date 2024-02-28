import { NextApiRequest, NextApiResponse } from "next";
import { testAtlases } from "../atlases";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  res.json(
    Object.values(testAtlases).find(
      (atlas) => atlas.atlasTitle === req.query.id
    )
  );
}
