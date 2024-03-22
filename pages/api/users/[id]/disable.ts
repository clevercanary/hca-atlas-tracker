import { NextApiRequest, NextApiResponse } from "next";
import {
  getUserRoleFromAuthorization,
  query,
} from "../../../../app/utils/user";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).setHeader("Allow", "POST").end();
    return;
  }
  const role = await getUserRoleFromAuthorization(req.headers.authorization);
  if (role !== "CONTENT_ADMIN") {
    res.status(role === null ? 401 : 403).end();
    return;
  }
  const id = req.query.id as string;
  if (!/^\d+$/.test(id)) {
    res.status(400).end();
    return;
  }
  // TODO what happens when the user doesn't exist?
  await query("UPDATE hat.users SET disabled=true WHERE id=$1", [id]);
  res.status(200).end();
}
