import { NextApiRequest, NextApiResponse } from "next";
import { getUserRoleFromAuthorization, query } from "../../app/utils/user";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const role = await getUserRoleFromAuthorization(req.headers.authorization);
  if (role !== "CONTENT_ADMIN") {
    res.status(role === null ? 401 : 403).end();
    return;
  }
  const queryResult =
    typeof req.query.email === "string"
      ? await query("SELECT * FROM hat.users WHERE email=$1", [req.query.email])
      : await query("SELECT * FROM hat.users");
  res.json(queryResult.rows);
}
