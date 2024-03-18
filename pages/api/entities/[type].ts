import { getAtlases } from "app/utils/get-entities";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const type = req.query.type as string;
  if (type === "atlases")
    res.json(
      Object.fromEntries(
        Object.entries(await getAtlases(req.headers.authorization))
      )
    );
  else res.status(404).end();
}
