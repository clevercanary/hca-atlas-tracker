import { getAtlases } from "app/utils/get-entities";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  res.json(
    Object.fromEntries(
      Object.entries(await getAtlases(req.headers.authorization))
    )
  );
}
